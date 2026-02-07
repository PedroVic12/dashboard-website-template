import { NextResponse } from "next/server"
import { transmissaoRepository } from "@/lib/repositories"

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const tipo = searchParams.get("tipo") // "linhas" | "intercambios" | "summary"
  const status = searchParams.get("status")
  const regiao = searchParams.get("regiao")

  switch (tipo) {
    case "intercambios":
      return NextResponse.json(transmissaoRepository.getIntercambios())
    case "summary":
      return NextResponse.json(transmissaoRepository.getSummary())
    case "linhas":
    default: {
      const filters = {}
      if (status) filters.status = status
      if (regiao) filters.regiao = regiao
      return NextResponse.json(transmissaoRepository.findAll(filters))
    }
  }
}
