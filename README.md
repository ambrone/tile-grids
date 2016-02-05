tile-grids
==========

One day I noticed an interesting tile pattern on the flow of a public bathroom.  I wondered how to code out a probability based tile grid generator to simulate the effect. After completing the task and feeling it was ripe for expansion I started added features.  Then I realized I could render the grids much faster with a canvas element instead of a bunch of square divs.  I was wanting to learn some mongoDB and more nodeJS so I added a way to save and recall grid designs to a backend then sessions and user login, ssl and password hashing and a few more things.  If I'm not completely sick of tile grids soon I will be using angular to rewrite the front end.


Tile Grid Designer - build, edit, and save square grid designs. A simple web-app I built to learn nodejs, express, jQuery, mongodb, mongoose, ssl, bcrypt, imageMagick, and Jade.

The three probability boxes (each initially set to 0.1) set probabilities for three types of colored tiles. When the grid is drawn('Fill Grid' button is pressed) each tile could flip to the first of the three colors with the probability set by the first box. The second flips each of these tiles' eight neighbors to the second color with the second probability. And the third does the same with the second group's neighbors. The 'at least' box allows setting a minimum number of flipped neighbors. Background and border color can be set as well. Clicking on any tile will flip it to the first color then flip its neighbors according to current field values. While focused on any of the probability inputs, the up and down arrows will edit these numbers and redraw the grid. Pressing enter while focused on a color input will change tiles on that iteration without redrawing the whole grid. The 'randomize' button will pick three random colors and redraw the grid with the rest of the inputs as set by the user.

You can create a username to save grids to the server. You can then save, recall, edit, update, and delete your grids. The 'update' button updates the file as well as the thumbnail dynamically.

