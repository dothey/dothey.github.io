
# -*- coding: utf-8 -*-

#!/usr/bin/python3
import wikipedia
import re
import nltk
from datascience import Table
from nameparser.parser import HumanName

alphabets= "([A-Za-z])"
prefixes = "(Mr|St|Mrs|Ms|Dr)[.]"
suffixes = "(Inc|Ltd|Jr|Sr|Co)"
starters = "(Mr|Mrs|Ms|Dr|He\s|She\s|It\s|They\s|Their\s|Our\s|We\s|But\s|However\s|That\s|This\s|Wherever)"
acronyms = "([A-Z][.][A-Z][.](?:[A-Z][.])?)"
websites = "[.](com|net|org|io|gov)"


"""
    parse.py

    MediaWiki Action API Code Samples
    Demo of `Parse` module: Parse content of a page
    MIT license


import requests

S = requests.Session()

URL = "https://en.wikipedia.org/w/api.php"

TITLE = "Pet door"

PARAMS = {
    'action': "parse",
    'page': TITLE,
    'format': "json"
}

R = S.get(url=URL, params=PARAMS)
DATA = R.json()

print(DATA)
"""""


with open('got_season1.txt', 'r') as myfile:
    data=myfile.read().replace('\n', '')

#print(wikipedia.WikipediaPage(title = 'Metropolis (1927 film)'))

# get the section of a page. In this case the Plot description of Metropolis
section = wikipedia.WikipediaPage(title="When She Was Bad").section('Plot')

# that will return fairly clean text, but the next line of code
# will help clean that up.
section = section.replace('\n','').replace("\'","")


def split_into_sentences(text):
    text = " " + text + "  "
    text = text.replace("\n"," ")
    text = re.sub(prefixes,"\\1<prd>",text)
    text = re.sub(websites,"<prd>\\1",text)
    if "Ph.D" in text: text = text.replace("Ph.D.","Ph<prd>D<prd>")
    text = re.sub("\s" + alphabets + "[.] "," \\1<prd> ",text)
    text = re.sub(acronyms+" "+starters,"\\1<stop> \\2",text)
    text = re.sub(alphabets + "[.]" + alphabets + "[.]" + alphabets + "[.]","\\1<prd>\\2<prd>\\3<prd>",text)
    text = re.sub(alphabets + "[.]" + alphabets + "[.]","\\1<prd>\\2<prd>",text)
    text = re.sub(" "+suffixes+"[.] "+starters," \\1<stop> \\2",text)
    text = re.sub(" "+suffixes+"[.]"," \\1<prd>",text)
    text = re.sub(" " + alphabets + "[.]"," \\1<prd>",text)
    if "”" in text: text = text.replace(".”","”.")
    if "\"" in text: text = text.replace(".\"","\".")
    if "!" in text: text = text.replace("!\"","\"!")
    if "?" in text: text = text.replace("?\"","\"?")
    text = text.replace(".",".<stop>")
    text = text.replace("?","?<stop>")
    text = text.replace("!","!<stop>")
    text = text.replace("<prd>",".")
    sentences = text.split("<stop>")
    sentences = sentences[:-1]
    sentences = [s.strip() for s in sentences]
    return sentences

def get_human_names(text):
    tokens = nltk.tokenize.word_tokenize(text)
    pos = nltk.pos_tag(tokens)
    sentt = nltk.ne_chunk(pos, binary = False)
    person_list = []
    person = []
    name = ""
    for subtree in sentt.subtrees(filter=lambda t: t.node == 'PERSON'):
        for leaf in subtree.leaves():
            person.append(leaf[0])
        if len(person) > 1: #avoid grabbing lone surnames
            for part in person:
                name += part + ' '
            if name[:-1] not in person_list:
                person_list.append(name[:-1])
            name = ''
        person = []

    return (person_list)



sentences = split_into_sentences(section)
#for sentence in sentences:
    #if sentence.find("kiss") > -1 :
    #    print(sentence)
#    print(sentence)
#print(section)
names = get_human_names(data)
print("LAST, FIRST")
for name in names:
    last_first = HumanName(name).last + ', ' + HumanName(name).first
    print(last_first)
print(names)


