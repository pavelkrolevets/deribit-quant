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
  var d1 = (Math.log(S / X) + (r + v * v / 2) * T) / (v * Math.sqrt(T));
  var d2 = d1 - v * Math.sqrt(T);
  if (PutCallFlag === "call") {
    return ( S * CND(d1)-X * Math.exp(-r * T) * CND(d2) );
  } else {
    return ( X * Math.exp(-r * T) * CND(-d2) - S * CND(-d1) );
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


/*
  With the "a" variables
function CND(x){
  var a1 = .31938153,
      a2 = -.356563782,
      a3 = 1.781477937,
      a4 = -1.821255978,
      a5 = 1.330274429;
  if(x<0.0) {
    return 1-CND(-x);
  } else {
    k = 1.0 / (1 + 0.2316419 * x);
    return ( 1 - Math.exp(-x * x / 2)/ Math.sqrt(2*Math.PI) * k * (a1 + k * (a2 + k * (a3 + k * (a4 + k * a5)))) );
  }
}
*/
