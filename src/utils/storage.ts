import { Project, Wall, Window, Door } from '../types/editor';

const STORAGE_KEY = '2d_editor_project';

export function saveProject(walls: Wall[], windows: Window[], doors: Door[]): void {
  const project: Project = {
    name: 'Unnamed Project',
    walls,
    windows,
    doors,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  } catch (error) {
    console.error('Failed to save project:', error);
  }
}

export function loadProject(): Project | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load project:', error);
  }
  return null;
}

export function clearProject(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear project:', error);
  }
}

export function exportProject(walls: Wall[], windows: Window[], doors: Door[]): void {
  const project: Project = {
    name: 'Exported Project',
    walls,
    windows,
    doors,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const dataStr = JSON.stringify(project, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

  const exportFileDefaultName = `floor-plan-${Date.now()}.json`;

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

export function importProject(file: File): Promise<Project> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const project = JSON.parse(e.target?.result as string);
        resolve(project);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
