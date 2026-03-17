# 🎯 AI Error Decoder

智能错误解析与修复建议工具 - 使用 AI 技术自动分析错误信息并提供解决方案

[English](./README_en.md) | 简体中文

## 📖 项目简介

AI Error Decoder 是一个强大的错误信息解析工具，可以自动识别和分析各种编程语言的错误，并提供智能的修复建议。

### 核心功能

- 🔍 **智能错误解析**: 自动识别错误类型、位置和堆栈跟踪
- 🤖 **AI 驱动的建议**: 使用 OpenAI GPT 模型提供精确的修复方案
- 🌐 **多语言支持**: 支持 Python、JavaScript、Java 等主流编程语言
- 💡 **规则引擎**: 无需 API Key 也可获得基于规则的通用建议
- 📊 **详细分析**: 提供错误原因、解决方案和预防措施

## 🚀 快速开始

### 安装

```bash
# 克隆项目
git clone https://github.com/196408245/ai-error-decoder.git
cd ai-error-decoder

# 安装依赖
pip install -r requirements.txt
```

### 基本用法

#### 方式一：直接输入错误信息

```bash
python main.py --error "FileNotFoundError: [Errno 2] No such file: 'test.txt'"
```

#### 方式二：从文件读取错误

```bash
python main.py --file error.log
```

#### 方式三：交互模式

```bash
python main.py --interactive
```

## 🎨 功能特性

### 1. 自动语言检测

工具可以自动识别错误所属的编程语言：

- Python: `FileNotFoundError`, `ImportError`, `SyntaxError` 等
- JavaScript: `ReferenceError`, `TypeError`, `SyntaxError` 等
- Java: `NullPointerException`, `ArrayIndexOutOfBoundsException` 等

### 2. 智能解析

解析内容包括：
- 错误类型和消息
- 涉及的文件路径
- 错误行号
- 完整的堆栈跟踪

### 3. AI 增强分析

设置 `OPENAI_API_KEY` 环境变量，获取更精确的 AI 分析：

```bash
# Linux/macOS
export OPENAI_API_KEY="your-api-key-here"

# Windows
set OPENAI_API_KEY=your-api-key-here

# 运行
python main.py --error "ImportError: No module named 'numpy'"
```

### 4. 基于规则的建议

即使没有 API Key，也能获得针对常见错误的通用建议：

- 常见错误类型列表
- 可能的原因分析
- 建议的解决步骤
- 预防措施

## 📚 使用示例

### 示例 1: Python 导入错误

```bash
$ python main.py --error "ImportError: No module named 'pandas'"

╔══════════════════════════════════════════════════════════════╗
║                    🐛 AI Error Decoder                        ║
╚══════════════════════════════════════════════════════════════╝

📌 错误类型: ImportError
📝 错误信息: No module named 'pandas'

🔍 可能原因:
   1. 模块未安装，请使用 pip install pandas 安装
   2. 模块名称拼写错误
   3. Python 路径配置问题

✅ 建议解决方案:
   1. 检查模块是否已安装: pip list
   2. 确认模块名称正确
   3. 检查 __init__.py 文件是否存在
```

### 示例 2: JavaScript 引用错误

```bash
$ python main.py --error "ReferenceError: x is not defined" --lang javascript
```

### 示例 3: 从日志文件分析

```bash
$ python main.py --file error.log
```

### 示例 4: 带上下文的分析

```bash
$ python main.py --error "TypeError: unsupported operand type(s) for +: 'int' and 'str'" --context "这段代码用于用户年龄计算"
```

## ⚙️ 配置选项

### 命令行参数

| 参数 | 简写 | 描述 | 默认值 |
|------|------|------|--------|
| `--error` | `-e` | 直接输入错误信息 | - |
| `--file` | `-f` | 从文件读取错误信息 | - |
| `--lang` | `-l` | 指定编程语言 | auto |
| `--api-key` | `-k` | OpenAI API Key | 环境变量 |
| `--model` | `-m` | AI 模型名称 | gpt-3.5-turbo |
| `--interactive` | `-i` | 交互模式 | False |
| `--context` | `-c` | 额外上下文信息 | - |

### 支持的编程语言

- `python` - Python 错误
- `javascript` - JavaScript 错误
- `java` - Java 错误
- `general` - 通用错误
- `auto` - 自动检测（默认）

### 环境变量

```bash
# OpenAI API Key (必需以使用 AI 功能)
OPENAI_API_KEY=your-api-key-here
```

## 🔧 开发

### 项目结构

```
ai-error-decoder/
├── main.py              # 主程序入口
├── requirements.txt     # 依赖包列表
├── README.md           # 项目说明
└── README_en.md        # 英文说明
```

### 运行测试

```bash
# 基本功能测试
python main.py --error "ValueError: invalid literal for int() with base 10: 'abc'"

# AI 功能测试 (需要设置 API key)
export OPENAI_API_KEY="your-key"
python main.py --error "ImportError: No module named 'requests'"
```

## 📝 常见错误代码

工具可以智能识别并提供建议的常见错误：

| 错误类型 | 描述 |
|---------|------|
| `ImportError` | 模块导入失败 |
| `FileNotFoundError` | 文件未找到 |
| `SyntaxError` | 语法错误 |
| `TypeError` | 类型错误 |
| `KeyError` | 字典键不存在 |
| `IndexError` | 索引超出范围 |
| `AttributeError` | 属性不存在 |
| `ValueError` | 值无效 |
| `ConnectionError` | 网络连接失败 |
| `PermissionError` | 权限不足 |

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👤 作者

**邮箱**: 196408245@qq.com

## 🙏 致谢

- 感谢所有开源贡献者
- 使用 OpenAI GPT API 提供智能分析
