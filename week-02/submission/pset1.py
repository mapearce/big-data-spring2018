#A1: Create a list containing any 4 strings.
print("Section A")
myList = ['do','you','like','cheese']
print("A1: ", myList)

#A2: Print the 3rd item in the list - remember how Python indexes lists!
print("A2:", myList[2])

#A3: Print the 1st and 2nd item in the list using [:] index slicing.
print("A3: ", myList[:2])

#A4: Add a new string with text “last” to the end of the list and print the list.
myList.append('last')
print("A4: ", myList)

#A5: Get the list length and print it.
print("A5: ", len(myList))

#A6: Replace the last item in the list with the string “new” and print
myList[-1] = 'new'
print("A6: ", myList,"\n\n\n")

#Now entering B territory
print("Section B")
sentence_words = ['I', 'am', 'learning', 'Python', 'to', 'munge', 'large', 'datasets', 'and', 'visualize', 'them']

#B1: Convert the list into a normal sentence with join(), then print.
print("B1: ", " ".join(sentence_words))

#B2: Reverse the order of this list using the .reverse() method, then print. Your output should begin with [“them”, ”visualize”, … ]
sentence_words.reverse()
print("B2: ", sentence_words)

#B3: Now user the .sort() method to sort the list using the default sort order.
sentence_words.sort()
print("B3: ", sentence_words)

#B4: Perform the same operation using the sorted() function. Provide a brief description of how the sorted() function differs from the .sort() method.
print("B4: ", sorted(sentence_words))
print("sorted() takes the list as an argument while .sort() is a method applied to the list.")
print("Additionally, sorted() is less efficient but can be used for any iterable (dictionaries, etc), not only lists (this is a constraint for .sort() )")

#B5: Extra Credit: Modify the sort to do a case case-insensitive alphabetical sort.
newSent = sorted(sentence_words, key=lambda x: x.lower())
#newSent function borrowed from: http://matthiaseisen.com/pp/patterns/p0005/
print("B5 (Extra Cred): ", newSent,"\n\n\n")


#C-Level
from random import randint

def firAsk():
    firstNum = input("Please provideth me with thine highest most valued number: \n")
    return firstNum

def secAsk():
    seconNum = input("If thou desireth, enter thine lowest most valued number (otherwise hitteth Enter): \n")
    return seconNum

def someFunc(x, y):
    if y == '':
        y = 0
    newNum = randint(int(y), int(x))
    print(str(newNum), "is a random integer between", y, "and", x)

print("Part C:")
someFunc(firAsk(), secAsk())
print("\n\n\n")

#Section D
def titAsk():
    book = input("What's your title, bro?\n")
    import re
    def titcase(s):
        return re.sub(r"[A-Za-z]+('[A-Za-z]+)?",lambda mo: mo.group(0)[0].upper() + mo.group(0)[1:].lower(), s)
    return titcase(book)
    #titcase function borrowed from: https://docs.python.org/3.5/library/stdtypes.html?highlight=title#str.title

def numAsk():
    number = input("How high up on the bestsellers list is it?\n")
    return number

def titRank(bk,num):
    print(f'The number {num} bestseller today is {bk}')

print("Section D: ")
titRank(titAsk(),numAsk())
print("\n\n\n")

#Section E - Password Validator
def pwdAsker():
#    bilbo = ''
    bilbo = input("What's your secret password? It should contain 8-14 characters, at least 2 digits, at least 1 uppercase, and at least 1 special character: \n")
    return bilbo

def pwdChecker(myPass):
    lenCheck = 0
    digCheck = 0
    uppCheck = 0
    spcCheck = 0
    print("I am checking the validity of password: ", myPass)
    for i in myPass:
        lenCheck += 1
        if i in ['0','1','2','3','4','5','6','7','8','9']:
            digCheck += 1
        if i.isupper():
            uppCheck += 1
        if i in ['!', '?', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '+', '=']:
            spcCheck += 1
    if (lenCheck >= 8 and lenCheck <=14 and digCheck >=2 and uppCheck >=1 and spcCheck >= 1):
        print("Your password is so good!")
    else:
        print("You are a cretin who doesn't pay attention to instructions.  Please try again...")
        print("Your most recent attempt contained",lenCheck,"characters, in which you had",digCheck,"numbers,",uppCheck,"uppers, and",spcCheck,"special characters.\n")
        pwdChecker(pwdAsker())

print("Section E:")
pwdChecker(pwdAsker())
print("\n\n\n")

#Section F
print("This is SECTION F!!!!")

def baseAsker():
    x = int(input("What's your base? "))
    return x

def expAsker():
    y = int(input("What's your exponent? "))
    return y

def expFun(x, y):
    newX = x
    newY = y
    iterator = 1
    while iterator < newY:
        newX = x * newX
        iterator += 1
    print("When you raise",x,"to the", newY,"you get:",newX)
    return int(newX)

expFun(baseAsker(),expAsker())


#Section G (Extra Credit)
extraList = [1,-4,9,30,-2,0]
ELmax = 0
ELmin = 0
for i in extraList:
    if i > ELmax:
        ELmax = i
    elif i < ELmin:
        ELmin = i
print("\n\n\nExtra Credit Section G:")
print("The list is:",  extraList)
print("The max val = " + str(ELmax))
print("The min val = " + str(ELmin))
