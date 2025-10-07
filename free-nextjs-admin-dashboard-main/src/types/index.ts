
export interface Task {
  id: number;
  title: string;
  date: string;
  status: "completed" | "pending";
}
