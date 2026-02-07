import { NextResponse } from "next/server"
import { energiaRepository } from "@/lib/repositories"

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const tipo = searchParams.get("tipo") // "geracao" | "matriz" | "demanda" | "consumo" | "summary"

  switch (tipo) {
    case "matriz":
      return NextResponse.json(energiaRepository.getMatrizEnergetica())
    case "demanda":
      return NextResponse.json(energiaRepository.getDemandaSemanal())
    case "consumo":
      return NextResponse.json(energiaRepository.getConsumoRegional())
    case "summary":
      return NextResponse.json(energiaRepository.getSummary())
    case "geracao":
    default:
      return NextResponse.json(energiaRepository.findAll())
  }
}
