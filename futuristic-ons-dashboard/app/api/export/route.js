import { NextResponse } from "next/server"
import { energiaRepository, transmissaoRepository, usinasSolaresRepository, usinasEolicasRepository, relatoriosRepository } from "@/lib/repositories"

/**
 * API de exportacao de dados em diferentes formatos.
 * GET /api/export?formato=csv|json|md&dados=energia|transmissao|solar|eolica|relatorios
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const formato = searchParams.get("formato") || "csv"
  const dados = searchParams.get("dados") || "energia"

  // Buscar dados do repositorio correto
  let data = []
  let title = ""

  switch (dados) {
    case "energia":
      data = energiaRepository.findAll()
      title = "Geracao de Energia Eletrica"
      break
    case "transmissao":
      data = transmissaoRepository.findAll()
      title = "Linhas de Transmissao"
      break
    case "solar":
      data = usinasSolaresRepository.findAll()
      title = "Usinas Solares"
      break
    case "eolica":
      data = usinasEolicasRepository.findAll()
      title = "Usinas Eolicas"
      break
    case "relatorios":
      data = relatoriosRepository.findAll()
      title = "Relatorios do SIN"
      break
    default:
      return NextResponse.json({ error: "Tipo de dados invalido" }, { status: 400 })
  }

  if (data.length === 0) {
    return NextResponse.json({ error: "Sem dados para exportar" }, { status: 404 })
  }

  switch (formato) {
    case "csv": {
      const headers = Object.keys(data[0])
      const csvRows = [
        headers.join(";"),
        ...data.map(row => headers.map(h => String(row[h] ?? "")).join(";"))
      ]
      const csvContent = csvRows.join("\n")

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="ons_${dados}_${Date.now()}.csv"`,
        },
      })
    }

    case "json": {
      const jsonContent = JSON.stringify({ title, exportedAt: new Date().toISOString(), data }, null, 2)

      return new NextResponse(jsonContent, {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="ons_${dados}_${Date.now()}.json"`,
        },
      })
    }

    case "md": {
      const headers = Object.keys(data[0])
      const mdLines = [
        `# ${title}`,
        "",
        `> Exportado em: ${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR")}`,
        "",
        `| ${headers.join(" | ")} |`,
        `| ${headers.map(() => "---").join(" | ")} |`,
        ...data.map(row => `| ${headers.map(h => String(row[h] ?? "")).join(" | ")} |`),
        "",
        `---`,
        `*Total de registros: ${data.length}*`,
      ]
      const mdContent = mdLines.join("\n")

      return new NextResponse(mdContent, {
        status: 200,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="ons_${dados}_${Date.now()}.md"`,
        },
      })
    }

    default:
      return NextResponse.json({ error: "Formato invalido. Use: csv, json, md" }, { status: 400 })
  }
}
