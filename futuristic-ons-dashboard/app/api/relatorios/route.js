import { NextResponse } from "next/server"
import { relatoriosRepository } from "@/lib/repositories"

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const tipo = searchParams.get("tipo") // "lista" | "kpis" | "anotacoes" | "summary"
  const filterType = searchParams.get("filter")

  switch (tipo) {
    case "kpis":
      return NextResponse.json(relatoriosRepository.getKpis())
    case "anotacoes":
      return NextResponse.json(relatoriosRepository.getAnotacoes())
    case "summary":
      return NextResponse.json(relatoriosRepository.getSummary())
    case "lista":
    default: {
      const filters = {}
      if (filterType && filterType !== "all") filters.type = filterType
      return NextResponse.json(relatoriosRepository.findAll(filters))
    }
  }
}

export async function POST(request) {
  const body = await request.json()
  const { action } = body

  if (action === "anotacao") {
    const anotacao = relatoriosRepository.addAnotacao({
      title: body.title,
      content: body.content,
    })
    return NextResponse.json(anotacao, { status: 201 })
  }

  return NextResponse.json({ error: "Acao invalida" }, { status: 400 })
}
