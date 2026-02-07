import { NextResponse } from "next/server"
import { usinasSolaresRepository, usinasEolicasRepository } from "@/lib/repositories"

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const fonte = searchParams.get("fonte") // "solar" | "eolica"
  const tipo = searchParams.get("tipo")   // "lista" | "geracao" | "summary"
  const status = searchParams.get("status")

  const repo = fonte === "eolica" ? usinasEolicasRepository : usinasSolaresRepository

  switch (tipo) {
    case "geracao":
      return NextResponse.json(
        fonte === "eolica" ? repo.getGeracaoPorVento() : repo.getGeracaoDiaria()
      )
    case "summary":
      return NextResponse.json(repo.getSummary())
    case "lista":
    default: {
      const filters = {}
      if (status) filters.status = status
      return NextResponse.json(repo.findAll(filters))
    }
  }
}
