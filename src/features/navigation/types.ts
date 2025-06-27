export type Screen = 'menu' | 'list' | 'detail' | 'ask';

export type AppState = {
  screen: Screen;
  selectedQuestion?: import('../questions/types.js').Question;
  questions: import('../questions/types.js').Question[];
};
