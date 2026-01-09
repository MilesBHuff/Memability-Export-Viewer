JavaScript script that does the following:
* Parse the JSON into an Array.
* Delete the task_type property from every element that has it.
* For each element, if it has a parent ID, loop through all other objects, checking their ID and their parent ID. Every time you find a match for the original parent ID, replace it with a number. Increment the number you use for each new unique element parent you find. Skip checking IDs that are numbers, as these have already been touched.
* Delete all non-numeric ID fields.
* Create new array containing objects with the following structure:
```
id
parent
modified
title
content
```
* Print that array.
