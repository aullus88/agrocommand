import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { DefaultPage } from "@/components/DefaultPage"
import { SectionCards } from "@/components/section-cards"

import data from "./data.json"

export default function Page() {
  return (
    <DefaultPage
      title="Visão Executiva"
      description="Painel executivo com indicadores-chave e análises estratégicas para tomada de decisão"
      breadcrumbs={[
        { label: "AgroCommand", href: "/dashboard" },
        { label: "Visão Executiva" },
      ]}
    >
      <SectionCards />
      <ChartAreaInteractive />
      <DataTable data={data} />
    </DefaultPage>
  )
}
