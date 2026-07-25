export interface FocusItem {
  title: string;
  done: boolean;
}

export const currentFocus: FocusItem[] = [
  { title: "Complete Bachelor's Degree", done: true },
  { title: "Build Terrasafi MVP", done: true },
  { title: "Launch AI Platform", done: false },
  { title: "Publish Open Source Frameworks", done: false },
  { title: "Expand Community Sandbox", done: false },
  { title: "Mentor Young Developers", done: false }
];
