/* The Black and Scholes (1973) Stock option formula */
export function blackScholes(PutCallFlag, S, X, T, r, v) {
  let d1, d2;
  d1 = (Math.log(S / X) + (r + v * v / 2.0) * T) / (v * Math.sqrt(T));
  d2 = d1 - v * Math.sqrt(T);

  if (PutCallFlag === "c")
    return S * cnd(d1)-X * Math.exp(-r * T) * cnd(d2);
  else
    return X * Math.exp(-r * T) * cnd(-d2) - S * cnd(-d1);
}

/* The cummulative Normal distribution function: */
export function cnd(x){
  let a1, a2, a3, a4 ,a5, k ;

  a1 = 0.31938153, a2 =-0.356563782, a3 = 1.781477937, a4= -1.821255978 , a5= 1.330274429;

  if(x < 0.0)
    return 1-cnd(-x);
  else
    k = 1.0 / (1.0 + 0.2316419 * x);

  return 1.0 - Math.exp(-x * x / 2.0)/ Math.sqrt(2*Math.PI) * k
    * (a1 + k * (-0.356563782 + k * (1.781477937 + k * (-1.821255978 + k * 1.330274429)))) ;

}
