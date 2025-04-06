# flask_app/services/openai_service.py
from openai import OpenAI
import os

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def generate_response(input_text, model="gpt-4o-mini"):
    """Generate ans using OpenAI API"""

    prompt = f"""
    Briefly answer to the following question.
    Question: {input_text}
    """
    
    try:
        chat_completion = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        # document error to the log and return apology
        print(f"OpenAI API error: {str(e)}")
        return "Sorry, we currently cannnot generate response"
