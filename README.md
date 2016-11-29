# Draft_Kings_PGA

This application assembles an optimal Draft Kings lineup for PGA Tour contests. 

It does so by:
* Maximizing total lineup value subject to Draft Kings PGA Tour contest constraints

Individual Player values are determined by:
* Normalizing stastistics selected by the user for the last X touraments the player has participated in.
  * Stastistics are normalized using Z-score standardization. 
  * This allows the user to consider golf stastistics of different units.
    * For example: Strokes Gained and GIR can be normalized and summed to one player value.

We build the optimal lineup using Binary Integer Programming:
  * Branch and Bound Algorithm
  * Simplex Algorithm

NOTE: The above methods and algorithm are implemented in Javscript.

Have fun, enjoy.
