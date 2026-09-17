export interface FocusItem {
  title: string;
  done: boolean;
}

export const currentFocus: FocusItem[] = [
  { title: "Complete Diploma in Business Information Technology", done: true },
  { title: "Build and validate the FODS marketplace", done: true },
  { title: "Build the Denis Chamkaga business platform", done: true },
  { title: "Prepare Terrasafi services and operating workflows", done: false },
  { title: "Connect DPO payments after production credentials", done: false },
  { title: "Grow practical training, partnerships, and customer support", done: false }
];
