# ccask Project Rules

## Project Overview

- **Purpose**: 技術用語の解説を管理・生成する学習支援 TUI ツール
- **Language**: TypeScript
- **Runtime**: Bun
- **Framework**: Effect-TS ecosystem (@effect/platform) + ink (TUI)
- **Main Features**:
  - バックグラウンドでの質問処理（真のバックグラウンド実行）
  - 質問の状態管理とデータ永続化
  - リアルタイム監視機能
  - インタラクティブ TUI インターフェース

## TypeScript Rules

### 基本原則

- 型定義は interface ではなく、type を使用する
- for よりも map などの method を優先して使用する
- できるだけ let は使わず、const を使用
- 外部で使われていない場合は export しない
- 使用していない import や変数は削除

### インポート・エクスポート

- ES Modules 使用時は .js 拡張子を明示してインポート
- 相対パス指定時は一貫したベースパスを使用
- デフォルトエクスポートよりも名前付きエクスポートを優先

### React/TUI 固有ルール

- useState, useEffect などの Hooks は適切に依存配列を指定
- useInput などの ink ライブラリの Hooks も同様に依存関係を管理
- React コンポーネントの Props は `[ComponentName]Props` 形式で命名

### 型安全性

- any 型の使用を避け、適切な型定義を行う
- オプショナル型は `?:` を使用
- Union types で状態を明確に表現
- 配列アクセス時は bounds check を実装

### エラーハンドリング

- Promise ベースの処理では適切な catch を実装
- 型ガードを使用して実行時型チェックを行う
- Error 型を継承したカスタムエラークラスを定義

## React/ink TUI Rules

### コンポーネント設計

- props の型は `[ComponentName]Props` という名前にする
- コンポーネント名は PascalCase を使用
- 1 つのファイルには 1 つのコンポーネントのみ定義

### Hooks 使用規則

- useState の初期値は明確な型を指定
- useEffect の依存配列は漏れなく指定
- useInput (ink) では適切なキーハンドリングを実装
- カスタム Hooks は `use` プレフィックスを使用

### ink 固有ルール

- Box コンポーネントでレイアウトを管理
- Text コンポーネントにはスタイリング用 props を直接指定しない（Box で wrap）
- useApp, useInput などの ink Hooks を適切に使用
- キーボードナビゲーションは一貫したパターンで実装

### 状態管理

- ローカル状態は useState
- 複数コンポーネント間の状態は props drilling または Context
- 状態更新は不変更新パターンを使用
- setState の関数型更新を活用

### ナビゲーション

- 画面遷移は明確な型定義された enum または union type で管理
- 階層的なナビゲーションでは ESC キーで一つ前の画面に戻る
- キーボードショートカットは各画面で一貫性を保つ

### エラーハンドリング

- try-catch でのエラーハンドリングを適切に実装
- ユーザーに分かりやすいエラーメッセージを表示
- 非同期処理のエラーは状態として管理

## Project Configuration Rules

### package.json 設定原則

#### ファイルパス指定

- エントリーポイントが `src/` ディレクトリにある場合は、すべてのスクリプトでパスを明示的に指定
- `main`, `module`, `bin` フィールドも適切なパスを指定
- 開発スクリプトとビルドスクリプトで一貫性を保つ

#### Bun プロジェクトでの設定

- `type: "module"` を設定して ES Modules を使用
- dev スクリプトは `bun run src/index.ts` 形式で直接実行
- build スクリプトでも同じパスを使用して一貫性を保つ

#### TUI アプリケーション設定

- ink を使用する場合は React と @types/react も必要
- peerDependencies で React のバージョンを明示
- デバッグ時は react-devtools-core を optionalDependencies に

### ディレクトリ構成とパス管理

#### src/ ベース構成

```
src/
├── index.ts          # エントリーポイント
├── tui/             # TUI関連コンポーネント
│   ├── App.tsx      # メインアプリケーション
│   └── components/  # TUIコンポーネント
├── core/           # コアロジック
├── types/          # 型定義
├── utils/          # ユーティリティ
└── workers/        # バックグラウンドワーカー
```

#### ビルド設定

- 常に src/ からの相対パスを基準にする
- インポート時は .js 拡張子を明示（ES Modules 要件）
- TypeScript 設定と package.json の設定を一致させる

#### エラー対処

- "Module not found" エラーが出た場合は package.json のパス設定を最初に確認
- dev/build スクリプトが同じファイルパスを参照していることを確認
- tsconfig.json の baseUrl 設定との整合性をチェック

## General Coding Practices

### 関数型アプローチ (FP)

- 純粋関数を優先
- 不変データ構造を使用
- 副作用を分離
- 型安全性を確保

### ドメイン駆動設計 (DDD)

- 値オブジェクトとエンティティを区別
- 集約で整合性を保証
- リポジトリでデータアクセスを抽象化
- 境界付けられたコンテキストを意識

### 実装手順

1. **型設計**: まず型を定義、ドメインの言語を型で表現
2. **純粋関数から実装**: 外部依存のない関数を先に、テストを先に書く
3. **副作用を分離**: IO 操作は関数の境界に押し出す
4. **アダプター実装**: 外部サービスや DB へのアクセスを抽象化

### コードスタイル

- 関数優先（クラスは必要な場合のみ）
- 不変更新パターンの活用
- 早期リターンで条件分岐をフラット化
- エラーとユースケースの列挙型定義
- main 関数を上部に配置
- コミット前にコードフォーマットを実行

## Critical Background Processing Rules

### True Background Execution

この**真のバックグラウンド実行**の実装は本プロジェクトの最重要技術的価値です：

```typescript
// 必須: 完全分離のstdio設定
const worker = spawn(WORKER_PATH, [JSON.stringify(args)], {
	detached: true,
	stdio: ["ignore", "ignore", "ignore"], // 完全分離
});

// 必須: 親プロセスとの関連切断
worker.unref();
```

### Worker Process Architecture

- JSON 形式での構造化パラメータ渡し
- 二重プロセス構造（親: UI 処理、ワーカー: LLM 処理）
- 即座のシェル復帰（50ms 以内）
- 並行実行対応

### Error Handling in Background

- ワーカープロセスの独立したエラーハンドリング
- ログファイルでの状態追跡
- データベース状態の同期更新

## Data Management Rules

### State Management

- questions.json での永続化
- 楽観的更新の回避
- 状態遷移の明確化
- データ整合性の保証

### File Operations

- ディレクトリの事前確認・作成
- 安全なファイル書き込み
- エラー時のロールバック

## Git Practices

### コミットの作成

- できるだけ小さい粒度で commit を作成する
- 変更の性質（新機能、バグ修正、リファクタリングなど）の把握
- 「なぜ」に焦点を当てる
- 明確で簡潔な言葉を使用

### 重要な注意事項

- 可能な場合は `git commit -am` を使用
- 関係ないファイルは含めない
- 空のコミットは作成しない
- git 設定は変更しない

### コミットメッセージの例

```bash
# 新機能の追加
feat: TUIインターフェースの実装

# 既存機能の改善
update: キーボードナビゲーションの改善

# バグ修正
fix: モジュールパス解決エラーを修正

# リファクタリング
refactor: TUIコンポーネントの構造化
```

## Security Considerations

### CLI/TUI Security

- 入力検証の徹底
- ファイルシステムの安全なアクセス
- コマンドインジェクションの防止

### Process Security

- 子プロセスの適切な管理
- リソースリークの防止
- セキュアなプロセス間通信

## Testing Strategy

### Background Process Testing

- mock-claude.ts でのテスト環境分離
- 即座終了テストの実装
- 並行実行テストの確保
- パフォーマンステストの実施

### TUI Testing

- インタラクティブコンポーネントのテスト
- キーボードイベントのシミュレーション
- 状態遷移のテスト

### テスト戦略

- 純粋関数の単体テストを優先
- インメモリ実装によるリポジトリテスト
- テスト可能性を設計に組み込む
- アサートファースト：期待結果から逆算

## Project-Specific Guidelines

### プロトタイプからの技術継承

本プロジェクトの価値は「真のバックグラウンド実行」の技術的工夫にあります。以下の要素は絶対に失ってはいけません：

1. **完全分離の stdio 設定**: `["ignore", "ignore", "ignore"]`
2. **JSON 形式パラメータ渡し**: 型安全性と構造化
3. **worker.unref()**: 親プロセス独立性
4. **環境変数によるテスト対応**: `NODE_ENV=test`での分岐

### TUI UX Philosophy

- 即座のフィードバック（50ms 以内）
- 直感的なキーボードナビゲーション
- リアルタイム状態更新
- 一貫したインターフェース設計

### アーキテクチャ決定

- TUI (ink) を採用し、インタラクティブな操作を実現
- CLIコマンドベースからTUIベースへ完全移行
- バックグラウンド処理の技術的価値は維持

### 開発原則

- インクリメンタルな機能実装
- 小さなコミット単位
- 包括的なテストカバレッジ
- パフォーマンスファースト

## Maintenance Guidelines

### Code Review Focus Points

- バックグラウンド実行の技術的工夫の保持
- 型安全性の確保
- TUI ナビゲーションの一貫性
- パフォーマンスの維持
- エラーハンドリングの適切性

### Refactoring Guidelines

- 既存の技術的価値の保護
- 段階的なリファクタリング
- テストカバレッジの維持
- 後方互換性の考慮

# important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User.

      IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context or otherwise consider it in your response unless it is highly relevant to your task. Most of the time, it is not relevant.
