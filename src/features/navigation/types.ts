import type { Question } from "../questions";

export type Screen = "menu" | "list" | "detail" | "ask";

export type AppState = {
	screen: Screen;
	selectedQuestion?: Question;
	questions: Question[];
};
