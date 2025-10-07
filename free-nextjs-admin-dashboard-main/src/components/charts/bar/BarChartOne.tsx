"use client";
import { RepositoryController } from "@/services/RepositoryController";
import { Task } from "@/types";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const repositoryController = new RepositoryController();

export default function BarChartOne() {
  const [series, setSeries] = useState<any[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const tasks = await repositoryController.getTasks();
      const completedTasksByMonth = new Array(12).fill(0);
      const pendingTasksByMonth = new Array(12).fill(0);

      tasks.forEach((task: Task) => {
        const month = new Date(task.date).getMonth();
        if (task.status === "completed") {
          completedTasksByMonth[month]++;
        } else {
          pendingTasksByMonth[month]++;
        }
      });

      setSeries([
        {
          name: "Completed Tasks",
          data: completedTasksByMonth,
        },
        {
          name: "Pending Tasks",
          data: pendingTasksByMonth,
        },
      ]);
    };

    fetchTasks();
  }, []);

  const options: ApexOptions = {
    colors: ["#34D399", "#FBBF24"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },

    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
  };

  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <div id="chartOne" className="min-w-[1000px]">
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={180}
        />
      </div>
    </div>
  );
}
