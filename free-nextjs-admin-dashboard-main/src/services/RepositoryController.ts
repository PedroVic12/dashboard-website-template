
export class RepositoryController {
  constructor() {
    console.log("RepositoryController initialized");
  }

  public async getTasks() {
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }
}
