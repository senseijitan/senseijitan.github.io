# 先生時短AI v3 基本設計・詳細設計

## 1. 画面構成

| ID | 画面 | 役割 |
|---|---|---|
| SCR-01 | ホーム | 5教科選択、よく使う機能、お気に入り、履歴 |
| SCR-02 | 教科ページ | 教科別単元一覧、教科特性、重点機能 |
| SCR-03 | 単元ページ | 授業・板書・図/挿絵・活動・ミニテスト・つまずき |
| SCR-04 | マイ授業デスク | よく使う、お気に入り、最近使った |
| SCR-05 | 利用分析 | 人気教科・人気機能・強化候補・機能マトリクス |

## 2. 教科別機能マトリクス

| 機能 | 国語 | 算数 | 理科 | 社会 | 英語 |
|---|---|---|---|---|---|
| 45分授業案 | ◎ | ◎ | ◎ | ◎ | ◎ |
| 板書 | ◎ | ◎ | ◎ | ◎ | ○ |
| ミニテスト | ◎ | ◎ | ◎ | ◎ | ◎ |
| 図・挿絵 | ○ | ◎ | ◎ | ◎ | ◎ |
| 発問 | ◎ | ◎ | ◎ | ◎ | ○ |
| 人物関係・心情 | ◎ | △ | △ | △ | △ |
| 数直線・図解 | △ | ◎ | ○ | △ | △ |
| 実験・観察 | △ | △ | ◎ | △ | △ |
| 地図・年表 | △ | △ | △ | ◎ | △ |
| 会話・音読 | ○ | △ | △ | △ | ◎ |
| 5分活動 | ◎ | ◎ | ◎ | ◎ | ◎ |
| つまずき対策 | ◎ | ◎ | ◎ | ◎ | ◎ |

## 3. DB設計（正式版）

### users
- id
- email
- plan
- school_type
- default_grade
- created_at

### subjects
- id
- code
- name
- icon
- display_order

### units
- id
- subject_id
- grade
- unit_name
- curriculum_version
- textbook_publisher
- objective
- key_points
- published

### lessons
- id
- unit_id
- lesson_no
- title
- goal
- level
- duration
- lesson_json

### board_examples
- id
- unit_id
- lesson_id
- level
- board_style
- image_url
- explanation
- source_type
- rights_status

### visual_assets
- id
- unit_id
- asset_type
- level
- title
- image_url
- alt_text
- rights_status

### quizzes
- id
- unit_id
- lesson_id
- level
- question_count
- questions_json
- answer_explanations_json

### resources
- id
- unit_id
- category
- site_name
- title
- url
- difficulty
- recommended_use
- copyright_note
- last_checked

### favorites
- id
- user_id
- content_type
- content_id
- created_at

### usage_logs
- id
- user_id
- subject_id
- unit_id
- feature
- action
- created_at

### user_preferences
- user_id
- preferred_subjects
- preferred_levels
- pinned_features
- ui_preferences

## 4. 個人最適化
基本レイアウトは固定し、次だけ個人化する。
- よく使う教科
- よく使う機能
- 最近使った単元
- お気に入り
- おすすめ

## 5. 難易度
- easy: やさしい
- standard: 標準
- challenge: チャレンジ
- support: 特別支援配慮

授業・板書・ミニテストを同一レベルで一括切替し、詳細設定で個別変更できる仕様を正式版で追加する。

## 6. UI方針
- カード型
- 画像/図を大きく
- 余白を広く
- 1画面の選択肢を絞る
- スマホでは下部固定ナビ
- 教科ごとに識別しやすい視覚差
- AI用語より「授業を作る」「板書を見る」など目的語を優先

## 7. 開発優先順位
1. 5教科ナビゲーション
2. 単元DB
3. レベル別授業案
4. 板書/図解
5. ミニテスト＋生徒向け解説
6. お気に入り/履歴
7. 利用分析
8. 外部教材DB
9. AI生成
10. 課金/認証


## 8. v4 ナビゲーション改善
- グローバル教科タブをトップバー直下に固定表示
- 現在選択中の教科タブを教科色でハイライト
- 教科ページでは「ホームに戻る」を明示
- 単元ページでは「教科の単元一覧に戻る」を明示
- パンくずも残し、現在地を把握できるようにする
- スマホでは教科タブを横スクロール化


## 9. v5 学年 + 教科ナビゲーション
- 上段：1年 / 2年 / 3年 / 4年 / 5年 / 6年
- 下段：国語 / 算数 / 理科 / 社会 / 英語
- 現在選択中の「学年・教科」を常時表示
- 学年を変えたら現在の教科を維持
- 教科を変えたら現在の学年を維持
- スマホは横スクロール対応
- 戻るボタンとパンくずは継続
