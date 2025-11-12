import streamlit as st
from wordcloud import WordCloud
import matplotlib.pyplot as plt

def create_wordcloud(text):
    wordcloud = WordCloud(width = 800, height = 800,
                background_color ='white',
                min_font_size = 10).generate(text)
    return wordcloud