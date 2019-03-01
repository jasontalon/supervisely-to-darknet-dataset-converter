# Supervise.ly to Darknet Dataset Converter
A utility which converts your [supervise.ly](https://supervise.ly/) training dataset to [Darknet](https://github.com/AlexeyAB/darknet) training dataset

## Introduction
I use [Supervise.ly](https://supervise.ly/) web platform to annotate and train my datasets using their hosted YOLOv3 model and to play around with object detection.

Then I discovered Darknet YOLOv3 particularly the repository fork of [AlexeyAB](https://github.com/AlexeyAB/darknet) which began my curiosity to dive deeper to understand the framework. 

This got me interested until the annotation part as the author recommended to use [Yolo_mark](https://github.com/AlexeyAB/Yolo_mark). Using the said utility is not easy to navigate and the image always distorted.

[Supervise.ly](https://supervise.ly/) has the best annotation tool so far. So why not generate your dataset by using Supervisely's annotation tool and train the generated dataset using your local copy of Darknet? 

That would be great, but the problem with that is both of them has a different dataset layout. Bounding boxes coordinates generated from supervise.ly is on actual (x,y) pixel position format whereas in Darknet, it uses the relative position based on percentage of the actual width, height. bounding boxes are calculated by the x/y center.

This utility would automate the conversion of Supervise.ly dataset to Darknet dataset.

## Limitation
1. This utility only recognizes rectangular annotation shape. Supervise.ly has a variety of shapes to annotate your classes.

##	Installation
1. Copy the repo and install dependencies.
```sh
$ npm install
```

## Instructions

1. Login to your supervise.ly account and select your project (dataset).
2. Download your dataset, uncompress the file and put the contents in the *input* folder under your repo directory. Ensure that the meta.json file is present, which contains the classes to be trained in Darknet.
3. Run the utility.
```sh
$ node index
```
4. Check the *output* directory under your repo directory. This will generate the following:
	- data/obj/*.jpg 	- training images 	(i.e., bag0001.jpg)
	- data/obj/*.txt 	- annotations		(i.e., bag0001.txt)
	- data/train.txt	- lists of images for training
	- data/obj.names	- lists of class names for training
	- data/obj.data		- contains the number of classes and directory info.

## Notes
Generated dataset layout for Darknet is based on AlexeyAB [guide](https://github.com/AlexeyAB/darknet#how-to-train-to-detect-your-custom-objects)

