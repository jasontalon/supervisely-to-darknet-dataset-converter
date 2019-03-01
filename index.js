const bluebird = require('bluebird'),
    fs = bluebird.promisifyAll(require('fs')),
    recursive = bluebird.promisifyAll(require('recursive-readdir')),
    _ = require('lodash'),
    path = require('path');

let main = async () => {
    try {
        if (!fs.existsSync('./input')) {
            console.log('input directory not found.');
            return;
        }

        let outDir = './output',
            dataDir = `${outDir}/data`,
            dataObjDir = `${dataDir}/obj`,
            meta = JSON.parse(await fs.readFileAsync('./input/meta.json', 'utf8'));

        if (!meta) {
            console.log('meta file not found.');
            return;
        }

        if (!fs.existsSync(outDir)) await fs.mkdirSync(outDir);

        if (!fs.existsSync(dataDir)) await fs.mkdirSync(dataDir);

        if (!fs.existsSync(dataObjDir)) await fs.mkdirSync(dataObjDir);

        let classes = _.map(_.filter(meta.classes, {
                shape: 'rectangle'
            }), 'title'),
            images = _.filter(await recursive('./input'), (image) => image.endsWith('.jpg') || image.endsWith('.jpeg')),
            annotations = await recursive('./input', ['meta.json', '*.jpg', '*.jpeg']);

        _.forEach(annotations, async (annotation) => {
            let imageFileName = getImage(images, annotation);

            if (!imageFileName) return;

            annotation = JSON.parse(await fs.readFileAsync(annotation, 'utf-8'));

            let coords = getAnnotationCoordinates(annotation, classes, images);

            await fs.copyFileAsync(imageFileName, `${dataObjDir}/${path.basename(imageFileName)}`);

            await fs.writeFileAsync(`${dataObjDir}/${path.parse(imageFileName).name}.txt`, _.map(coords, (o) => `${o.classIndex} ${o.coords.x_center} ${o.coords.y_center} ${o.coords.width} ${o.coords.height}`).join('\n').trimEnd('n'));
        });

        await fs.writeFileAsync(`${dataDir}/obj.names`, _.join(classes, '\n').trimEnd('\n'));

        await fs.writeFileAsync(`${dataDir}/train.txt`, _.map(images, (i) => `data/obj/${path.basename(i)}`).join('\n').trimEnd('\n'));

        await fs.writeFileAsync(`${dataDir}/obj.data`, `classes=${classes.length}\nrain=data/train.txt\nvalid=data/test.txt\nnames=data/obj.names\nbackup=backup/`);
    } catch (error) {
        console.log(error);
    }
    finally{
        console.log('done');
    }
};

let getImage = (images, annotation) => _.find(images,
    (image) => _.eq(path.parse(image).name,
        path.parse(annotation).name)
);

let getRelativeCoords = (xx, xy, yx, yy, width, height) => {
    let x_absolute = ((xx + yx) / 2),
        y_absolute = ((xy + yy) / 2),
        x_center = parseFloat(x_absolute / width),
        y_center = parseFloat(y_absolute / height),
        width_absolute = Math.abs(xx - yx),
        height_absolute = Math.abs(yy - xy),
        _height = parseFloat(height_absolute / height),
        _width = parseFloat(width_absolute / width);

    return {
        x_center,
        y_center,
        width: _width,
        height: _height
    };
};

let getAnnotationCoordinates = (annotation, classes) => {
    let coords = [];

    _.forEach(annotation.objects, (object) => {
        if (!_.includes(classes, object.classTitle)) return;

        let classIndex = _.indexOf(classes, object.classTitle),
            exterior = object.points.exterior,
            xx = exterior[0][0],
            xy = exterior[0][1],
            yx = exterior[1][0],
            yy = exterior[1][1];

        coords.push({
            classIndex,
            coords: getRelativeCoords(xx, xy, yx, yy, annotation.size.width, annotation.size.height)
        });
    });

    return coords;
};

main();