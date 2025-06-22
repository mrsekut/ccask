# Ask CLI Project Rules

## Project Overview

- **Purpose**: 技術用語の解説を管理・生成する学習支援 CLI ツール
- **Language**: TypeScript
- **Runtime**: Bun
- **Framework**: Effect-TS ecosystem (@effect/cli, @effect/platform)
- **Main Features**:
  - バックグラウンドでの質問処理（真のバックグラウンド実行）
  - 質問の状態管理とデータ永続化
  - リアルタイム監視機能
  - CLI インターフェース

## TypeScript Rules

### Code Style

- 関数型プログラミングを重視
- Effect エコシステムの活用
- 型安全性の最優先
- ES Modules 使用（.js 拡張子でのインポート）

### Type Definitions

- 全てのデータ構造に対して明確な型定義
- Union types の積極的使用
- Optional chaining と nullish coalescing の適切な使用
- 型ガードの実装

### File Organization

```
src/
├── types/          # 型定義
├── core/           # コアビジネスロジック
├── commands/       # CLIコマンド実装
├── utils/          # ユーティリティ関数
└── workers/        # バックグラウンドワーカー
```

## Effect-TS Specific Rules

### Effect Programming

- `Effect.gen`を使用した非同期処理
- `Effect.promise`での Promise ラッピング
- 適切なエラーハンドリング
- `Effect.provide`でのコンテキスト提供

### CLI Development with @effect/cli

- `Command.make`での構造化されたコマンド定義
- `Options`と`Args`の適切な使用
- サブコマンドの階層化
- ヘルプ生成の活用

## Bun Runtime Rules

### Project Configuration

- `package.json`の`type: "module"`設定
- Bun のビルトイン機能活用
- 高速な起動時間の維持

### File Operations

- `fs/promises`の使用
- 非同期ファイル操作の徹底
- パフォーマンスを意識した I/O 操作

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

## General Coding Practices

### Function Design

- 単一責務の原則
- 純粋関数の優先
- 副作用の明確な分離
- 小さく再利用可能な関数

### Error Handling

- 型安全なエラーハンドリング
- 詳細なエラーメッセージ
- ログ記録の徹底
- ユーザーフレンドリーなエラー表示

### Performance

- 最小限のメモリ使用
- 効率的なファイル I/O
- バックグラウンド処理の最適化

## Git Practices

### Commit Messages

- 機能ベースの小さなコミット
- Conventional Commits 形式
- 詳細な説明の提供
- 技術的工夫の明記

### Branch Strategy

- 機能ごとのブランチ作成
- プルリクエストでのレビュー
- マスターブランチの保護

## Security Considerations

### CLI Security

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

### Integration Testing

- 全ワークフローのテスト
- データ整合性のテスト
- エラーケースのテスト

## Project-Specific Guidelines

### プロトタイプからの技術継承

本プロジェクトの価値は「真のバックグラウンド実行」の技術的工夫にあります。以下の要素は絶対に失ってはいけません：

1. **完全分離の stdio 設定**: `["ignore", "ignore", "ignore"]`
2. **JSON 形式パラメータ渡し**: 型安全性と構造化
3. **worker.unref()**: 親プロセス独立性
4. **環境変数によるテスト対応**: `NODE_ENV=test`での分岐

### CLI UX Philosophy

- 即座のフィードバック（50ms 以内）
- 直感的なコマンド体系
- 豊富な情報表示
- リアルタイム監視機能

### 開発原則

- インクリメンタルな機能実装
- 小さなコミット単位
- 包括的なテストカバレッジ
- パフォーマンスファースト

## Maintenance Guidelines

### Code Review Focus Points

- バックグラウンド実行の技術的工夫の保持
- 型安全性の確保
- パフォーマンスの維持
- エラーハンドリングの適切性

### Refactoring Guidelines

- 既存の技術的価値の保護
- 段階的なリファクタリング
- テストカバレッジの維持
- 後方互換性の考慮
