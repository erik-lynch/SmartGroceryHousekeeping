% CS467: Online Capstone Project
% Group: Smart Grocery Housekeeping

% Compiled Using:
%   "FOOD Share - Shelf Life Guide" - Ventura County Food Bank
%   "The Food Expiration Dates You Should Actually Follow" - NYTimes, J. Kenji López-Alt
%   "Storage Times For Refrigerated Foods" - USDA
%   "Freezing and Food Safety" - USDA 
%   "Shelf-Stable Food Safety" - USDA
%   FoodSafety.gov

% In the US, food products are dated in the following four ways (this dating is voluntary with the exception of baby formula):
%   1.  "Sell-by" - tells the store how long to display the product for sale.
%   2.  "Best if Used By" - recommended for best flavor or quality. It is not a purchase or safety date.
%   3.  "Use By" - the last date recommended for use of the product while at peak quality. The manufacturer of the product has determined the date.
%   4.  "Exp. (Expires)" - this is a true expiration date. The food is not safe to eat and must be thrown away.

% In an effort to reduce food waste, this knowledge base has been provided to allow users to more accurately determine when products may still be safe 
% to eat even if the date on the product has passed. 




% Refrigerated ------------------------------------------

refrigerated('cooked rice', 3, 4).
refrigerated('cooked pasta', 3, 4).

refrigerated('ground beef', 1, 2).
refrigerated('ground turkey', 1, 2).
refrigerated('ground veal', 1, 2).
refrigerated('ground pork', 1, 2).
refrigerated('ground lamb', 1, 2).
refrigerated('stew meat', 1, 2).

refrigerated('apple', 28, 42).

% Frozen ------------------------------------------------

frozen('cooked apple', 240, 240).

% Pantry ------------------------------------------------

pantry('formula', 'Do use past manufacture date.').
pantry('baby formula', 'Do use past manufacture date.').
pantry('infant formula', 'Do use past manufacture date.').

pantry('rice', 730, 730).
pantry('pasta', 730, 730).

pantry('apple', 21, 21).




