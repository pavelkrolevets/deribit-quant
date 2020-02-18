/*
  PutCallFlag: Either "put" or "call"
  S: Stock Price
  X: Strike Price
  T: Time to expiration (in years)
  r: Risk-free rate
  v: Volatility
  This is the same one found in http://www.espenhaug.com/black_scholes.html
  but written with proper indentation and a === instead of == because it's
  faster, and it doesn't declare 5 useless variables (although if you really
  want to do it to have more elegant code I left a commented CND function in
  the end)
*/


export function BlackScholes(PutCallFlag, S, X, T, r, v) {
  var d1 = (Math.log(1 / (X/S)) + (r + v * v / 2) * T) / (v * Math.sqrt(T));
  var d2 = d1 - v * Math.sqrt(T);
  if (PutCallFlag === "call") {
    return ( CND(d1) - (X/S) * Math.exp(-r * T) * CND(d2));
  } else {
    return ( (X/S) * Math.exp(-r * T) * CND(-d2) - CND(-d1));
  }
}

/* The cummulative Normal distribution function: */
function CND(x){
  if(x < 0) {
    return ( 1-CND(-x) );
  } else {
    let k = 1 / (1 + .2316419 * x);
    return ( 1 - Math.exp(-x * x / 2)/ Math.sqrt(2*Math.PI) * k * (.31938153 + k * (-.356563782 + k * (1.781477937 + k * (-1.821255978 + k * 1.330274429)))) );
  }
}

