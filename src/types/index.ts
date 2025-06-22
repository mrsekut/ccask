export type QuestionStatus = "pending" | "generating" | "completed" | "failed";

export type Question = {
  id: string;
  term: string;
  status: QuestionStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  filepath?: string;
  error?: string;
};

export type QuestionsDB = {
  questions: Question[];
  metadata: {
    version: string;
    lastUpdated: string;
  };
};

export type WorkerArgs = {
  question: string;
  filepath: string;
  claudeCommand?: string;
};