# pip install spacy-streamlit

"""
The package includes building blocks that call into Streamlit and set up all the required elements for you. You can either use the individual components directly and combine them with other elements in your app, or call the visualize function to embed the whole visualizer.

Download the English model from spaCy to get started.

python -m spacy download en_core_web_sm
Then put the following example code in a file.

# streamlit_app.py
import spacy_streamlit

models = ["en_core_web_sm", "en_core_web_md"]
default_text = "Sundar Pichai is the CEO of Google."
spacy_streamlit.visualize(models, default_text)
You can then run your app with streamlit run streamlit_app.py. The app should pop up in your web browser. 😀

📦 Example: 01_out-of-the-box.py
Use the embedded visualizer with custom settings out-of-the-box.

streamlit run https://raw.githubusercontent.com/explosion/spacy-streamlit/master/examples/01_out-of-the-box.py
👑 Example: 02_custom.py
Use individual components in your existing app.

streamlit run https://raw.githubusercontent.com/explosion/spacy-streamlit/master/examples/02_custom.py


"""