export class Feedback {
  id!: string;
  userId!: string;
  userName!: string;
  rating!: number;
  category!: string;
  comments!: string;
  createdAt!: Date;
}

export const FeedbackCategories = [
  'Service Quality',
  'Staff Behavior',
  'Pricing',
  'Timeliness',
  'Other'
];
