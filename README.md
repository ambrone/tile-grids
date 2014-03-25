tile-grids
==========

Tile Grid Designer - build, edit, and save square grid designs.  A simple web-app I built to learn nodejs, express, jQuery, mongodb, mongoose, ssl, bcrypt, imageMagick, and Jade.

The 'first', 'second', and 'third' labeled inputs set probabilities for three types of colored tiles.  The first color flips each tile on a blank grid with probability 'first'.  The second flips each of these tiles' eight neighbors to the second color with probability 'second'.  And the third does the same with the second group.  The 'at least' box allows setting a minimum number of flipped neighbors.  I did this to prevent a bunch of lone tiles looking weird.  Background and border color can be set as well.  Clicking on any tile will flip it to the first color then flip its neighbors according to current field values.  While focused on any of the probability inputs, the up and down arrows will edit these numbers and redraw the grid.  Pressing enter while focused on a color input will change tiles on that iteration without redrawing the whole grid. The 'randomize' button will pick three random colors and redraw the grid with the rest of the inputs as set by the user(probabilities, border, background).  The save thumb button under the grid will generate an image file and print it below the grid.  This can then be saved by the user.

You can create a username to save grids to the server.  You can then save, recall, edit, update, and delete your grids.  The 'update' button updates the file as well as the thumbnail dynamically.
