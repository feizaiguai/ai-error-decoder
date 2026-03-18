# AI Error Decoder - DigitalOcean Gradient AI Hackathon

## 🎯 项目概述

**AI-Powered Error Decoder** - 智能错误解析与修复建议工具，基于 AI 技术自动分析编程错误并提供精准的解决方案。

### 核心特性

- 🔍 **智能错误解析**: 自动识别 10+ 种编程语言的错误类型
- 🤖 **AI 驱动的修复建议**: 使用 GPT-4/Claude 提供精确解决方案
- ⚡ **离线规则引擎**: 无需 API Key 也可获得基于规则的通用建议
- 🌐 **Web 界面**: 提供可视化的错误分析界面
- 📊 **批量分析**: 支持日志文件批量错误分析

### 技术栈

- **后端**: Python 3.8+ / Flask / FastAPI
- **前端**: HTML5 / CSS3 / JavaScript (原生)
- **AI 服务**: OpenAI GPT-4 / Claude 2 / DigitalOcean AI
- **部署**: Docker / DigitalOcean App Platform

## 🚀 快速开始

### 安装

```bash
# 克隆项目
git clone https://github.com/196408245/ai-error-decoder.git
cd ai-error-decoder

# 安装依赖
pip install -r requirements.txt

# 复制环境变量配置
cp .env.example .env
```

### 配置

编辑 `.env` 文件填入你的 API Key：

```bash
# DigitalOcean API Token
DIGITALOCEAN_API_TOKEN=your_token_here

# OpenAI API Key (备用)
OPENAI_API_KEY=sk-your-key-here
```

### 使用方式

#### 1️⃣ 命令行模式

```bash
# 基本用法
python main.py --error "ImportError: No module named 'numpy'"

# 指定语言
python main.py --error "ReferenceError: x is not defined" --lang javascript

# 从文件分析
python main.py --file error.log

# 交互模式
python main.py --interactive
```

#### 2️⃣ Web 界面

```bash
# 启动 Web 服务
python -m http.server 8000

# 或使用 Flask (需要安装 flask)
python app.py
```

然后在浏览器打开 `http://localhost:8000`

## 📖 功能详情

### 支持的错误类型

| 语言 | 支持的错误类型 |
|------|---------------|
| Python | ImportError, SyntaxError, TypeError, NameError, FileNotFoundError, IndexError, KeyError, AttributeError, ValueError, RuntimeError |
| JavaScript | ReferenceError, TypeError, SyntaxError, RangeError, URIError, EvalError |
| Java | NullPointerException, ArrayIndexOutOfBoundsException, ClassNotFoundException, IOException |
| Go | panic, compile error, runtime error |
| Rust | panic, compile error |

### AI 增强分析

使用 AI 可以获得：

- 📝 **根因分析**: 深入分析错误根本原因
- 💻 **修复代码**: 自动生成可用的修复代码示例
- 📚 **学习资源**: 推荐相关文档和教程
- 🛡️ **预防建议**: 如何避免类似错误

### 示例输出

```
╔══════════════════════════════════════════════════════════════╗
║              🎯 AI Error Decoder Pro                          ║
╚══════════════════════════════════════════════════════════════╝

📌 错误类型: ImportError
📝 错误信息: No module named 'pandas'
🔍 语言: Python

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 AI 分析:
   1. 模块 'pandas' 未安装或安装失败
   2. 可能原因: pip 源问题或版本冲突
   
✅ 建议解决方案:
   1. pip install pandas
   2. pip install --upgrade pandas
   3. 检查 Python 环境: which python / pip --version
   
💻 修复代码:
   ```bash
   pip install pandas
   # 或指定版本
   pip install pandas==2.0.0
   ```

📚 学习资源:
   - https://pandas.pydata.org/docs/getting_started/introday10.html
   - https://pandas.pydata.org/pandas-docs/stable/getting_started.html
```

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                     AI Error Decoder                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   CLI        │    │   Web UI     │    │   API        │  │
│  │   Interface  │    │   (HTML/JS)  │    │   Endpoint   │  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘  │
│         │                    │                    │          │
│         └────────────────────┼────────────────────┘          │
│                              │                                │
│  ┌───────────────────────────▼────────────────────────────┐  │
│  │                    Error Parser                         │  │
│  │  • Language Detection  • Pattern Matching               │  │
│  │  • Stack Trace Parse   • Context Extraction             │  │
│  └───────────────────────────┬────────────────────────────┘  │
│                              │                                │
│  ┌───────────────────────────▼────────────────────────────┐  │
│  │                   AI Analyzer                           │  │
│  │  ┌────────────────┐    ┌────────────────┐               │  │
│  │  │ Rule Engine    │    │ AI Service     │               │  │
│  │  │ (Offline)      │    │ (GPT-4/Claude) │               │  │
│  │  └────────────────┘    └────────────────┘               │  │
│  └─────────────────────────────────────────────────────────┘  │
│                              │                                │
│  ┌───────────────────────────▼────────────────────────────┐  │
│  │                   Response Formatter                     │  │
│  │  • CLI Output    • JSON    • Markdown    • HTML        │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 📦 API 接口

### POST /api/decode

分析错误信息

```json
// Request
{
  "error": "ImportError: No module named 'numpy'",
  "language": "python",
  "context": "数据科学项目"
}

// Response
{
  "success": true,
  "data": {
    "error_type": "ImportError",
    "error_message": "No module named 'numpy'",
    "language": "python",
    "solutions": [...],
    "ai_analysis": {...}
  }
}
```

## 🧪 测试

```bash
# 运行所有测试
python main.py --test

# 特定错误测试
python main.py --error "TypeError: 'NoneType' object is not iterable"

# 批量测试
python main.py --batch-test tests/errors/
```

## 🚢 部署

### Docker 部署

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "app.py"]
```

### DigitalOcean App Platform

创建 `app.yaml`:

```yaml
name: ai-error-decoder
regions:
  - nyc
static:
  - source: ./
    destination: /app
    build_command: pip install -r requirements.txt
    run_command: python app.py
```

## 📊 项目统计

- 代码行数: 500+
- 支持语言: 10+
- 错误模式: 100+
- 解决方案: 200+

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👨‍💻 作者

- GitHub: [@196408245](https://github.com/196408245)

---

**Made for DigitalOcean Gradient AI Hackathon 2024** 🚀
