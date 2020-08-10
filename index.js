import {points} from './points.js';

let sensivity;
let rangeInfo;
let svg;
let floorBtns;
let btnInit;
let btnCluster;

let currentFloor = "22.8";
let initDataFlag = true;
let clusterflag = true;

let currentPoints;
let wInit = 3000;
let hInit = 1850;
let r = wInit/hInit;
let svgW = 1000;
let svgH = svgW/r;

window.addEventListener('load', load);
function load() {
    floorBtns = [...document.querySelectorAll('.floor')];
    floorBtns.forEach(floor => floor.addEventListener('click', currentFloorFn));
    let range = document.getElementById('vol');
    rangeInfo = document.getElementById('range');
    btnInit = document.getElementById('init');
    btnInit.addEventListener('click', initFn);
    btnCluster = document.getElementById('cluster');
    btnCluster.addEventListener('click', clusterizeFn);
    sensivity = +range.value;
    rangeInfo.innerHTML = sensivity;
    range.addEventListener('change', rangeFn);
    range.addEventListener('input', rangeFn);

    let totalPoints = document.querySelector('.totalPoints');
    let totalClusters = document.querySelector('.totalClusters');
    let totalSingleClusters = document.querySelector('.totalSingleClusters');

    cretaSVG();    

    initVisualization(initDataFlag, clusterflag);

}

function showMessage(selector, message, data) {
    document.querySelector(selector).innerHTML = `${message}: ${data}`;
}

function initVisualization(isInit, isCluster) {
    let element = findElementByDataSet('.floor', 'floor', currentFloor);
    showActiveElement(element, false, '.floor');

    currentPoints = pointsOnFloor(currentFloor);
    console.log('point onfloor:', currentPoints.length);
    console.log('cluster should be shown: ', isCluster);
    console.log('init should be shown: ', isInit);

    if(isInit) {
        
        showActiveElement(btnInit);
        visulizeData('initLayer', currentPoints, currentFloor);
        showMessage('.totalPoints', 'POINTS ON FLOOR', currentPoints.length);
    }

    if(isCluster) {        
        showActiveElement(btnCluster);
        let pointsForClusters = [...currentPoints];
        let clusterPoints = clusterize(pointsForClusters, sensivity);
        //console.log('clusterPoints***', clusterPoints);
        visulizeCluster('clusterLayer', clusterPoints, currentFloor);
        showMessage('.totalClusters', 'CLUSTERS ON FLOOR', clusterPoints.length)
        showMessage('.totalSingleClusters', 'CLUSTERS WITH ONE POINT', clusterPoints.filter(item=> item.points.length === 1).length);
    }
    
}

function clusterizeFn() {
    clusterflag = !clusterflag;
    showActiveElement(btnCluster, true);
    let pointsForClusters = [...currentPoints];
    let clusterPoints = clusterize(pointsForClusters, sensivity);

    if(clusterflag) {
        visulizeCluster('clusterLayer', clusterPoints, currentFloor);
        showMessage('.totalClusters', 'CLUSTERS ON FLOOR', clusterPoints.length)
        showMessage('.totalSingleClusters', 'CLUSTERS WITH ONE POINT', clusterPoints.filter(item=> item.points.length === 1).length);
    } else {
        deleteElement('.clusterLayer'); 
        showMessage('.totalClusters', 'CLUSTERS ON FLOOR', '')
        showMessage('.totalSingleClusters', 'CLUSTERS WITH ONE POINT', '');
    }
}


// click init
function initFn() {    
    initDataFlag = !initDataFlag;
    showActiveElement(btnInit, true);
    if(initDataFlag) {
        visulizeData('initLayer', currentPoints, currentFloor);
        showMessage('.totalPoints', 'POINTS ON FLOOR', currentPoints.length);
    } else {
        deleteElement('.initLayer'); 
        showMessage('.totalPoints', 'POINTS ON FLOOR', '');
    }
}



function clickSvg() {
    console.log('click')
}
//-----------------------------------------------------------------------------------
function deleteElement(className) {
    if(svg.select(className))  svg.select(className).remove()
}


//visualize on svg
function visulizeData(className, points, floor) {  
    deleteElement(className); 
    svg
        .select('.wrapperLayer')
        .append('g')
        .attr('class', `${className} ${floor}`)
        .selectAll('circle')
        .data(points)
        .join("circle")
        .attr('cx', d => d.x_img * svgW / 3000)
        .attr('cy', d => d.y_img * svgH / 1850)
        .attr('pointer-events', 'visible')
        .attr('r', 5)
        .attr('fill', 'red'); 
}

function visulizeCluster(className, points, floor) {  
    deleteElement(className);
    svg
        .select('.wrapperLayer')
        .append('g')
        .attr('class', `${className} ${floor}`); 

    svg
        .select(`.${className}`)
        .append('g')
        .attr('class', 'pins')
        .selectAll('circle')
        .data(points)
        .join("circle")
        .attr('cx', d => d.centroid.x * svgW / 3000)
        .attr('cy', d => d.centroid.y * svgH / 1850)
        .attr('pointer-events', 'visible')
        .attr('r', 7)
        .attr('fill', 'green')
        .on('mouseenter', d => highLight(d, true))
        .on('mouseleave', d => highLight(d, false))

    svg
        .select(`.${className}`)
        .append('g')
        .attr('class', `pointsSum`)
        .selectAll("g")
        .data(points)
        .join("g")
        .append("text")
        .attr("x", d => {
            return d.centroid.x * svgW / 3000;
        })
        .attr("y", d => d.centroid.y * svgW / 3000)
        .attr("text-anchor", "middle")
        .attr("font-size", 10)
        .attr("fill", "white")
        .attr("font-family", "sans-serif")
        .attr("dy", "3")
        .attr("dx", "0")
        .attr("pointer-events", "none")
        .text(d => d.points.length);

    
}


function highLight(d, isBuild) {
    let centrX = d.centroid.x;
    let centrY = d.centroid.y;

    if(!isBuild) {
        svg.select('.highLight').remove();
        svg.select('.radius').remove();

    }
    if(isBuild) {
        svg
            .select('.wrapperLayer')
            .append('g')
            .attr('class', 'highLight')
            .selectAll('circle')
            .data(d.points)
            .join("circle")
            .attr('cx', d => d.x_img * svgW / 3000)
            .attr('cy', d => d.y_img * svgH / 1850)
            .attr('pointer-events', 'visible')
            .attr('r', 3)
            .attr('fill', 'yellow'); 

        svg
            .select('.wrapperLayer')
            .append('g')
            .attr('class', 'radius')
            .append('circle')
            .attr('cx',  centrX * svgW / 3000)
            .attr('cy',  centrY * svgH / 1850)
            .attr('pointer-events', 'visible')
            .attr('r', sensivity/2*1850/3000)
            .attr('stroke', 'orange')
            .attr('fill', 'none'); 

    }

}

//find by key in dataset
function findElementByDataSet(wrapper, datasetKey, datasetValue) {
    let element = [...document.querySelectorAll(wrapper)].find(element => {
        if(element.dataset && element.dataset[datasetKey]) {
            return element.dataset[datasetKey] === datasetValue;
        } else {
            return null
        }
    })
    return element ? element : null
}

//svg create
function cretaSVG() {
    svg = d3
        .select('body')
        .append('svg')
        .attr("width", svgW)
        .attr("height", svgH)
        // .on('click', clickSvg)

    const wrapperLayer = svg
        .append('g')
        .attr('class', 'wrapperLayer')


    const zoom = d3.zoom()
        .scaleExtent([0.3, 8])
        .on("zoom", zoomed);

    svg.call(zoom);
}

// show checked element
function showActiveElement(element, istoogle = false, className= false ) {
    if(istoogle) {
        element.classList.toggle('checked');
        return
    }
    if(className) {
        [...document.querySelectorAll(className)].forEach(btn => {
            if(btn.classList.contains('checked')) {
                btn.classList.remove('checked')
            }
        })
    }    
    element.classList.add('checked')
} 

//clicked on floorBTN
function currentFloorFn(e) {
    let element = e.target;
    let floor =  e.target.dataset.floor;
    showActiveElement(element, false, '.floor');
    currentFloor = floor;
    currentPoints = pointsOnFloor(floor);
    if(initDataFlag) {
        deleteElement('.initLayer');
        visulizeData('initLayer', currentPoints, currentFloor);
        showMessage('.totalPoints', 'POINTS ON FLOOR', currentPoints.length);
    }
    if(clusterflag) {
        let pointsForClusters = [...currentPoints];
        let clusterPoints = clusterize(pointsForClusters, sensivity);
        deleteElement('.clusterLayer'); 
        visulizeCluster('clusterLayer', clusterPoints, currentFloor);
        showMessage('.totalClusters', 'CLUSTERS ON FLOOR', clusterPoints.length)
        showMessage('.totalSingleClusters', 'CLUSTERS WITH ONE POINT', clusterPoints.filter(item=> item.points.length === 1).length);
    }

}


// range
function rangeFn(e) {
    sensivity = e.target.value;
    rangeInfo.innerHTML = sensivity;
    if(clusterflag) {
        let pointsForClusters = [...currentPoints];
        let clusterPoints = clusterize(pointsForClusters, sensivity);
        deleteElement('.clusterLayer'); 
        visulizeCluster('clusterLayer', clusterPoints, currentFloor);
        showMessage('.totalClusters', 'CLUSTERS ON FLOOR', clusterPoints.length)
        showMessage('.totalSingleClusters', 'CLUSTERS WITH ONE POINT', clusterPoints.filter(item=> item.points.length === 1).length);
    }

}

//pointsOnFloor
function pointsOnFloor(floor) {
    return floor === "all" ? points : points.filter(point => point.level === "level_" + floor)
}

//zoomed
function zoomed() {
    const {transform} = d3.event;
    svg.select('.wrapperLayer').attr("transform", transform);
  }

//---------------------------------
function clusterize(points, baseDistance){
    console.log('baseDistance', baseDistance)
    function Vector2(x,y){
        this.x = x;
        this.y = y;
        this.distanceTo = function(otherVector){
            if (!otherVector) throw 'NullPointerException';
            if (!(otherVector instanceof Vector2)) throw 'wrong type!';
            const dx = this.x - otherVector.x;
            const dy = this.y - otherVector.y;
            return Math.sqrt( dx * dx + dy * dy );
        };
        this.add = function(otherVector){
            if (!otherVector) throw 'NullPointerException';
            if (!(otherVector instanceof Vector2)) throw 'wrong type!';
            this.x += otherVector.x;
            this.y += otherVector.y;
            return this;
        };
        this.subtract = function(otherVector){
            if (!otherVector) throw 'NullPointerException';
            if (!(otherVector instanceof Vector2)) throw 'wrong type!';
            this.x -= otherVector.x;
            this.y -= otherVector.y;
            return this;
        };
        this.lengthSquared = function(){
            return this.x * this.x + this.y * this.y;
        };
        this.length = function(){
            return Math.sqrt(this.lengthSquared());
        };
        this.scalarDivide = function(scalar){
            this.x /= scalar;
            this.y /= scalar;
            return this;
        };
        this.scalarMultiply = function(scalar){
            this.x *= scalar;
            this.y *= scalar;
            return this;
        };
        this.copy = function(){
            return new Vector2(this.x, this.y);
        };
    }
    function Cluster(firstPoint){
        this.points = [firstPoint];
        this.centroid = firstPoint.position.copy();
        this.recalculateCentroid = function(){
            this.centroid = this.points.reduce(function(accumulator, currentValue){
                return accumulator.add(currentValue.position);
            }, new Vector2(0, 0)).scalarDivide(this.points.length);
            return this.centroid;
        };
        this.addPoint = function(point){
            this.centroid.scalarMultiply(this.points.length).add(point.position).scalarDivide(this.points.length+1);
            this.points.push(point);
        };
    }

    const clasters = [];
    const distances = {};
    const distanceFromCount = function(count){
        let d = distances[count];
        if (d) return d;

        d = baseDistance ;//* Math.pow(1.001, count-2);
        d = d * d; // squared
        distances[count] = d;
        return d;
    };

    points.forEach(function(point){point.position = new Vector2(point.x_img, point.y_img);});

    points.forEach(function(point, index){
        if (!point) return;

        let newCluster = new Cluster(point);
        points[index] = null;
        points.forEach(function (point, index){
            if (!point) return;
            const distance = newCluster.centroid.copy().subtract(point.position).lengthSquared();
            if (distance < distanceFromCount(newCluster.points.length)){
                newCluster.addPoint(point);
                points[index] = null;
            }
        });
        clasters.push(newCluster);
    });
    return clasters;
}


//--------------------------------------------------------
//clasters
// console.log()
// let counter = 0
// let clusterArr = [];
// clasterization(points, 600);


// function clasterization(points, sensivity) {
//     let pointsInWork = points.map(point => {
//         point.pointImg = {x: point.x_img, y: point.y_img};
//         return point
//     })
//     console.log('**init',pointsInWork.length)
//     while(pointsInWork.length > 1) {
//         let point = pointsInWork[0];
//         pointsInWork.splice(0,1);
//         let cluster = {};
//         cluster.id = ++counter;
//         cluster.clusterPoints = [point];
//         cluster.cash = [];
//         cluster.widgetPoint = {x: null, y: null};
//         let filteredpointsInWork = [...pointsInWork];
//         pointsInWork.forEach(item => {
//             let distanceObj = getDistance(item, point);
    
//             if (distanceObj.distance < sensivity) {
//                 cluster.cash.push(...distanceObj.cash);
//                 cluster.clusterPoints.push(item);
    
//                 filteredpointsInWork = filteredpointsInWork.filter(val => val.name !== item.name)
//             }
//         })
//         clusterArr.push(cluster);
//         pointsInWork = [...filteredpointsInWork];
//     }




//     console.log("clusterArr", clusterArr)
//     console.log('pointsInWork', pointsInWork.length)
// }

// findCenter(clusterArr[0])
// function findCenter(clusterPoints) {
//     let minDistance = Math.min(...clusterPoints.cash.map(item => item.distance));

//     console.log('min dist:', minDistance);
//     let initPoint = clusterPoints.find(val => val.distance === minDistance);

//     console.log('min dist point:', initPoint);


// }



// function getDistance(pointA, pointB) {
//     let cashName = pointA.name + "_" + pointB.name;
//     let cashNameReverse = pointB.name + "_" + pointA.name
//     let distance = Math.floor(Math.sqrt((pointA.pointImg.x - pointB.pointImg.x)**2 + (pointA.pointImg.y - pointB.pointImg.y)**2));
//     let currentCash = [{name: cashName, distance}, {name: cashNameReverse, distance}];
//     return {distance, cash: currentCash}
// }