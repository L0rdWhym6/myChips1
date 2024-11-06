
import os
from telegram import Update, WebAppInfo, KeyboardButton, ReplyKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes

# Use your bot token
BOT_TOKEN = "8167308061:AAFjY5Wu24V-M1HzhMbshGATQ6eys5UVvYY"

# URL of your Web-App (replace with the actual URL when you deploy the application)
WEBAPP_URL = "https://your-webapp-url.com"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Sends a message with a button to open the Web-App."""
    keyboard = [
        [KeyboardButton("Open Game", web_app=WebAppInfo(url=WEBAPP_URL))]
    ]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
    await update.message.reply_text("Click the button below to open the game:", reply_markup=reply_markup)

def main() -> None:
    """Starts the bot."""
    application = Application.builder().token(BOT_TOKEN).build()

    application.add_handler(CommandHandler("start", start))

    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
