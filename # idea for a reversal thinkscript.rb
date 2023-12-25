# idea for a reversal thinkscript 

# one way of improving the performance of the supply & demand short strategy
# is to automatically sell when a reversal occurs before price reaches demand

# there are problems with this, but the rewards outweigh the risks
# the biggest problem/challenge is that overall profits may be reduced
# if the script covers too early instead of allowing the trade to unfold

# can leverage lower lows & lower highs/ higher lows & higher highs
# to describe a reversal 
# (how many candles? it's not necessarily about the *number* of candles)

# start with the smallest case and expand/refactor => 3 candles

def currentLow = low;
def prevLow = low[1];
def prevLow2 = low[2];

def currentHigh = high;
def prevHigh = high[1];
def prevHigh2 = high[2];

# work backwards from the present (i.e. a reversal has just happened rather than
# a reversal will happen)

def isShortReversal = currentHigh > prevHigh and currentLow > prevLow and prevLow < prevLow2
    and prevHigh < prevHigh2; # add too AddOrder() logic in thinkscript
    
# another way to solve this challenge is to define a min moving profit lock-in
# (this approach remove the risk of a false reversal)

# back-test both approaches and see which one performs more reliably!

def isProfitLockIn; 

# this is more difficult to solve with thinkscript because I don't know the order p&l
# what proxy can I create for the order p&l and order price? 
# if I know price and profit, then I can add logic to lock-in a min percentage
# or value amount based on inputs
# this is still challenging because then I need to know whether or not current price 
# has reached this point and whether it has crossed this point during a reversal
# actually, I only need to know the latter! A price lock-in is a pivot level!

# I know programmatically where each supply/demand range is and that at most 12 ranges
# are rendered. I can define at most 12 more ranges that act as pivot points and are offsets
# from supply/demand ranges

# if the price lock-in input type is a percentage amount (e.g. 15%) then it will 
# be: (1 - lock-in percentage) * range price. (this is faulty logic because the securities
# are leveraged) => the price movement percentages are much smaller

# if the price lock-in input type is a value amount (e.g. $1) then it will
# be each supply/demand rangePrice - valueAmount (this is a solution worth testing!)
# the logic is then simple. either cover if market price crosses above this lock-in price
# or keep the current logic, which does a stop loss at the high end of the supply/demand range

