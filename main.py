#!/usr/bin/env python3
"""
AI Error Decoder
解析错误信息并使用 AI 给出修复建议
"""

import os
import sys
import json
import re
import argparse
from typing import Dict, Optional, List
from dataclasses import dataclass
from pathlib import Path


@dataclass
class ErrorInfo:
    """错误信息数据结构"""
    error_type: str
    error_message: str
    file_path: Optional[str] = None
    line_number: Optional[int] = None
    stack_trace: Optional[str] = None
    raw_error: str = ""


class ErrorParser:
    """错误信息解析器"""
    
    # 常见编程语言的错误模式
    ERROR_PATTERNS = {
        'python': [
            r'(?P<error_type>[\w]+Error): (?P<error_message>.+)',
            r'File "(?P<file_path>.+)", line (?P<line_number>\d+)',
        ],
        'javascript': [
            r'(?P<error_type>\w+Error): (?P<error_message>.+)',
            r'at\s+(?P<file_path>.+):(?P<line_number>\d+):\d+',
        ],
        'java': [
            r'(?P<error_type>[\w]+Exception): (?P<error_message>.+)',
            r'at\s+(?P<file_path>.+)\((?P<line_number>\d+)\)',
        ],
        'general': [
            r'ERROR:\s*(?P<error_message>.+)',
        ]
    }
    
    @classmethod
    def parse(cls, error_text: str, language: str = 'auto') -> ErrorInfo:
        """解析错误信息"""
        error_type = "UnknownError"
        error_message = ""
        file_path = None
        line_number = None
        stack_trace = None
        
        lines = error_text.strip().split('\n')
        
        # 检测语言
        if language == 'auto':
            language = cls._detect_language(error_text)
        
        # 解析错误类型和消息
        if language in cls.ERROR_PATTERNS:
            for pattern in cls.ERROR_PATTERNS[language]:
                match = re.search(pattern, error_text)
                if match:
                    if 'error_type' in match.groupdict():
                        error_type = match.group('error_type')
                    if 'error_message' in match.groupdict() and not error_message:
                        error_message = match.group('error_message')
                    if 'file_path' in match.groupdict():
                        file_path = match.group('file_path')
                    if 'line_number' in match.groupdict():
                        line_number = match.group('line_number')
        
        # 提取堆栈跟踪
        stack_lines = []
        in_stack = False
        for line in lines:
            if any(marker in line for marker in ['File "', 'at ', '  File', '\tat ']):
                in_stack = True
            if in_stack:
                stack_lines.append(line)
        stack_trace = '\n'.join(stack_lines) if stack_lines else None
        
        return ErrorInfo(
            error_type=error_type,
            error_message=error_message or error_text[:200],
            file_path=file_path,
            line_number=int(line_number) if line_number else None,
            stack_trace=stack_trace,
            raw_error=error_text
        )
    
    @classmethod
    def _detect_language(cls, error_text: str) -> str:
        """自动检测编程语言"""
        if 'File "' in error_text and ('line' in error_text.lower() or 'import ' in error_text):
            return 'python'
        elif 'at ' in error_text and ('.js:' in error_text or '.ts:' in error_text):
            return 'javascript'
        elif 'Exception:' in error_text or 'at ' in error_text and '.java' in error_text:
            return 'java'
        return 'general'


class AIErrorDecoder:
    """AI 错误解码器核心类"""
    
    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-3.5-turbo"):
        """
        初始化 AI 解码器
        
        Args:
            api_key: API 密钥，如果为 None 则从环境变量 OPENAI_API_KEY 读取
            model: 使用的模型名称
        """
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        self.model = model
        
    def decode(self, error_info: ErrorInfo, context: str = "") -> str:
        """
        使用 AI 解码错误并生成修复建议
        
        Args:
            error_info: 解析后的错误信息
            context: 额外的上下文信息
            
        Returns:
            修复建议文本
        """
        if not self.api_key:
            # 如果没有 API key，返回基于规则的通用建议
            return self._generate_rule_based_advice(error_info)
        
        # 使用 AI API 生成建议
        return self._get_ai_advice(error_info, context)
    
    def _generate_rule_based_advice(self, error_info: ErrorInfo) -> str:
        """生成基于规则的通用建议"""
        
        # 常见错误类型和建议
        COMMON_ERRORS = {
            'ImportError': {
                'message': '模块导入错误',
                'causes': [
                    '模块未安装，请使用 pip install <module_name> 安装',
                    '模块名称拼写错误',
                    'Python 路径配置问题',
                ],
                'solutions': [
                    '检查模块是否已安装: pip list',
                    '确认模块名称正确',
                    '检查 __init__.py 文件是否存在',
                ]
            },
            'FileNotFoundError': {
                'message': '文件未找到',
                'causes': [
                    '文件路径不正确',
                    '文件被删除或移动',
                    '文件名拼写错误',
                ],
                'solutions': [
                    '检查文件路径是否正确',
                    '使用绝对路径而非相对路径',
                    '确认当前工作目录',
                ]
            },
            'SyntaxError': {
                'message': '语法错误',
                'causes': [
                    '代码语法不符合 Python 规范',
                    '缩进错误',
                    '括号、引号不匹配',
                ],
                'solutions': [
                    '检查错误行的代码语法',
                    '使用 IDE 的语法检查功能',
                    '注意缩进（建议使用 4 个空格）',
                ]
            },
            'TypeError': {
                'message': '类型错误',
                'causes': [
                    '操作或函数应用于不兼容的类型',
                    '参数类型不匹配',
                    'None 与其他类型进行操作',
                ],
                'solutions': [
                    '检查变量的类型',
                    '使用 type() 查看变量类型',
                    '添加类型转换或类型检查',
                ]
            },
            'KeyError': {
                'message': '字典键错误',
                'causes': [
                    '字典中不存在该键',
                    '键名称拼写错误',
                ],
                'solutions': [
                    '使用 dict.get() 方法避免 KeyError',
                    '先检查键是否存在: if key in dict',
                    '使用 collections.defaultdict',
                ]
            },
            'IndexError': {
                'message': '索引错误',
                'causes': [
                    '索引超出序列范围',
                    '列表为空',
                ],
                'solutions': [
                    '使用 len() 检查序列长度',
                    '使用负索引时注意范围',
                    '先检查列表是否为空',
                ]
            },
            'AttributeError': {
                'message': '属性错误',
                'causes': [
                    '对象没有该属性或方法',
                    '变量名拼写错误',
                    '导入错误的模块',
                ],
                'solutions': [
                    '检查对象类型和可用属性',
                    '使用 hasattr() 检查属性存在',
                    '确认正确导入了模块',
                ]
            },
            'ValueError': {
                'message': '值错误',
                'causes': [
                    '参数值不在有效范围内',
                    '值格式不符合要求',
                ],
                'solutions': [
                    '检查参数的有效取值范围',
                    '添加参数验证',
                    '查看函数文档了解参数要求',
                ]
            },
            'ConnectionError': {
                'message': '连接错误',
                'causes': [
                    '网络连接失败',
                    '服务器不可用',
                    '防火墙阻止连接',
                ],
                'solutions': [
                    '检查网络连接',
                    '确认服务器地址和端口',
                    '检查防火墙设置',
                ]
            },
            'PermissionError': {
                'message': '权限错误',
                'causes': [
                    '没有文件访问权限',
                    '没有执行权限',
                ],
                'solutions': [
                    '使用管理员权限运行',
                    '修改文件权限: chmod',
                    '检查文件所有者',
                ]
            },
            'ReferenceError': {
                'message': '引用错误（JavaScript）',
                'causes': [
                    '使用未定义的变量',
                    '变量在作用域外',
                ],
                'solutions': [
                    '确保变量已声明',
                    '检查变量作用域',
                    '确认变量在使用前已赋值',
                ]
            },
        }
        
        # 获取错误类型信息
        error_type = error_info.error_type.replace('Error', '').replace('Exception', '')
        
        advice = f"""
╔══════════════════════════════════════════════════════════════╗
║                    🐛 AI Error Decoder                        ║
╚══════════════════════════════════════════════════════════════╝

📌 错误类型: {error_info.error_type}
📝 错误信息: {error_info.error_message}

"""
        
        if error_type in COMMON_ERRORS:
            error_data = COMMON_ERRORS[error_type]
            advice += f"""
🔍 可能原因:
"""
            for i, cause in enumerate(error_data['causes'], 1):
                advice += f"   {i}. {cause}\n"
            
            advice += f"""
✅ 建议解决方案:
"""
            for i, solution in enumerate(error_data['solutions'], 1):
                advice += f"   {i}. {solution}\n"
        else:
            advice += f"""
🔍 通用分析:
   这是一个 {error_info.error_type}，表示程序遇到了运行时问题。

✅ 建议解决步骤:
   1. 仔细阅读错误信息，定位问题发生的位置
   2. 检查相关代码的逻辑和语法
   3. 查看堆栈跟踪信息，从下往上排查
   4. 使用调试器或打印语句定位具体问题
   5. 搜索错误信息寻找类似问题的解决方案

"""
        
        if error_info.file_path:
            advice += f"""
📂 涉及文件: {error_info.file_path}
"""
            if error_info.line_number:
                advice += f"📍 涉及行号: {error_info.line_number}\n"
        
        advice += f"""
───────────────────────────────────────────────────────────────
💡 提示: 要获取更精确的 AI 分析，请设置 OPENAI_API_KEY 环境变量
   export OPENAI_API_KEY="your-api-key"
───────────────────────────────────────────────────────────────
"""
        
        return advice
    
    def _get_ai_advice(self, error_info: ErrorInfo, context: str) -> str:
        """调用 AI API 获取修复建议"""
        try:
            import requests
            
            prompt = f"""你是一个经验丰富的程序员和调试专家。请分析以下错误信息并提供修复建议。

错误类型: {error_info.error_type}
错误信息: {error_info.error_message}
"""
            
            if error_info.file_path:
                prompt += f"涉及文件: {error_info.file_path}\n"
            if error_info.line_number:
                prompt += f"涉及行号: {error_info.line_number}\n"
            if error_info.stack_trace:
                prompt += f"\n堆栈跟踪:\n{error_info.stack_trace}\n"
            if context:
                prompt += f"\n额外上下文:\n{context}\n"
            
            prompt += """
请提供：
1. 错误原因分析
2. 具体的修复步骤
3. 预防建议

请用中文回答，格式清晰易读。
"""
            
            response = requests.post(
                'https://api.openai.com/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {self.api_key}',
                    'Content-Type': 'application/json'
                },
                json={
                    'model': self.model,
                    'messages': [
                        {'role': 'system', 'content': '你是一个专业的程序员调试助手，擅长分析和解决各种编程错误。'},
                        {'role': 'user', 'content': prompt}
                    ],
                    'temperature': 0.7,
                    'max_tokens': 1000
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                ai_response = result['choices'][0]['message']['content']
                
                return f"""
╔══════════════════════════════════════════════════════════════╗
║                    🐛 AI Error Decoder                        ║
╚══════════════════════════════════════════════════════════════╝

📌 错误类型: {error_info.error_type}
📝 错误信息: {error_info.error_message}

🤖 AI 分析与建议:

{ai_response}

───────────────────────────────────────────────────────────────
"""
            else:
                return f"API 调用失败: {response.status_code}\n" + self._generate_rule_based_advice(error_info)
                
        except ImportError:
            return "请安装 requests 库: pip install requests\n" + self._generate_rule_based_advice(error_info)
        except Exception as e:
            return f"AI 分析出错: {str(e)}\n" + self._generate_rule_based_advice(error_info)


def main():
    """主函数"""
    parser = argparse.ArgumentParser(
        description='AI Error Decoder - 智能错误解析与修复建议工具',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例用法:
  # 直接输入错误信息
  python main.py --error "FileNotFoundError: [Errno 2] No such file: 'test.txt'"

  # 从文件读取错误信息
  python main.py --file error.log

  # 指定编程语言
  python main.py --error "ReferenceError: x is not defined" --lang javascript

  # 交互模式
  python main.py --interactive

  # 使用环境变量设置 API key
  export OPENAI_API_KEY="your-api-key"
  python main.py --error "ImportError: No module named 'numpy'"
        """
    )
    
    parser.add_argument('--error', '-e', type=str, help='直接输入错误信息')
    parser.add_argument('--file', '-f', type=str, help='从文件读取错误信息')
    parser.add_argument('--lang', '-l', type=str, default='auto', 
                       choices=['auto', 'python', 'javascript', 'java', 'general'],
                       help='指定编程语言 (默认: auto)')
    parser.add_argument('--api-key', '-k', type=str, help='OpenAI API Key (也可以设置环境变量 OPENAI_API_KEY)')
    parser.add_argument('--model', '-m', type=str, default='gpt-3.5-turbo',
                       help='AI 模型 (默认: gpt-3.5-turbo)')
    parser.add_argument('--interactive', '-i', action='store_true', help='交互模式')
    parser.add_argument('--context', '-c', type=str, help='额外的上下文信息')
    
    args = parser.parse_args()
    
    # 创建解码器实例
    decoder = AIErrorDecoder(api_key=args.api_key, model=args.model)
    
    # 确定错误信息来源
    error_text = ""
    
    if args.interactive:
        print("╔══════════════════════════════════════════════════════════════╗")
        print("║          🎯 AI Error Decoder - 交互模式                        ║")
        print("╚══════════════════════════════════════════════════════════════╝")
        print("请粘贴错误信息 (输入完成后按 Ctrl+D 或空行结束):\n")
        
        lines = []
        try:
            while True:
                line = input()
                lines.append(line)
        except EOFError:
            pass
        
        error_text = '\n'.join(lines)
        
    elif args.error:
        error_text = args.error
        
    elif args.file:
        try:
            with open(args.file, 'r', encoding='utf-8') as f:
                error_text = f.read()
        except FileNotFoundError:
            print(f"错误: 文件 '{args.file}' 不存在")
            sys.exit(1)
        except Exception as e:
            print(f"读取文件错误: {str(e)}")
            sys.exit(1)
    else:
        parser.print_help()
        print("\n📌 请提供错误信息 (使用 --error, --file 或 --interactive)")
        print("   或直接在此粘贴错误信息后按 Enter:\n")
        
        lines = []
        try:
            while True:
                line = input()
                if line.strip() == '':
                    break
                lines.append(line)
        except EOFError:
            pass
        
        if lines:
            error_text = '\n'.join(lines)
        else:
            print("未提供错误信息，退出程序。")
            sys.exit(0)
    
    if not error_text.strip():
        print("错误信息为空，退出程序。")
        sys.exit(0)
    
    # 解析错误
    parser_instance = ErrorParser()
    error_info = parser_instance.parse(error_text, args.lang)
    
    # 获取修复建议
    advice = decoder.decode(error_info, args.context or "")
    
    # 输出结果
    print(advice)


if __name__ == '__main__':
    main()
