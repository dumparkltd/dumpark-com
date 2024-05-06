// global var DECLARATION

var margin = {top: 80, right: 80, bottom: 40, left: 80},
    width = 960 - margin.left - margin.right,
    height = 720 - margin.top - margin.bottom;	
	
var svg,svgmap,xym,path,circle,line;

var contourmap,landmap,currentmap,releasemap;

var pi=3.1415;

var m0,
    o0;
var feature,land,release,current;

var view="map";

var gyre;

var formatNumber = d3.format(",.0f"),
    format = function(d) { return formatNumber(d) + " Particles"; };

var link,node;
var selection="land";

var sankey = d3.sankey()
    .nodeWidth(40)
    .nodePadding(0)
    .size([width, height]);
var sankeypath = sankey.link();

// loading ...
$(function() {

	//INIT HTML VIEW
	$("#subtitle_sankey").hide();
	$(".intro_sankey").hide();
	
	//SVG frame
height = $(window).height() - $('#map').offset().top;
width=$('#map').width();		
	
svg = d3.select("#map").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");	
	
d3.select(window)
	.on("mousemove", mousemove)
	.on("mouseup", mouseup)
	.on("touchmove", touchmove)
	.on("touchend", touchup);

// LOAD SVGMAP	
svgmap=svg.append("g")
		.on("mousedown", mousedown)
		.on("touchstart", touchdown)
		.attr("id","svgmap");

svgmap.append("circle")
	.attr("id","backsphere")
	.style("cursor","pointer");

// LOAD ICONS
//Mapview and Source View

svg.append("rect")
	.attr("id","mapicon_bgrnd")
	.attr("class","selectIcon selectIcon_on")
	.on("click",function(){view="map";switchView()})
	.on("tap",function(){view="map";switchView()})
	.style("cursor","pointer");
svg.append("rect")
	.attr("id","sankicon_bgrnd")
	.attr("class","selectIcon")
	.on("click",function(){view="san";switchView()})
	.on("tap",function(){view="san";switchView()})
	.style("cursor","pointer");	
	
svg.append("svg:g")
	.attr("id","mapicon")
	.on("click",function(){view="map";switchView()})
	.on("tap",function(){view="map";switchView()});
svg.append("svg:g")
	.attr("id","sankicon")
	.on("click",function(){view="san";switchView()})
	.on("tap",function(){view="san";switchView()});		
	
svg.append("text")
	.attr("id","mapicon_txt")
	.text("MAP VIEW")
	.attr("class","iconlabel");
svg.append("text")
	.attr("id","sankicon_txt")
	.text("SOURCE VIEW")
	.attr("class","iconlabel");	
svg.append("line")
	.attr("id","mapicon_line")
	.attr("fill","none")
	.attr("stroke","#000000") 
	.attr("stroke-width",1);
svg.append("line")
	.attr("id","sankicon_line")
	.attr("fill","none")
	.attr("stroke","#000000") 
	.attr("stroke-width",1);	
	
// help
svg.append("svg:g")
	.attr("id","rotateicon");	
svg.append("svg:g")
	.attr("id","arrowicon");	
svg.append("svg:g")
	.attr("id","arrowicon2");		
svg.append("text")
	.attr("id","rotateicon_txt")
	.text("ROTATE THE GLOBE")
	.attr("class","helplabel");		
svg.append("text")
	.attr("id","arrowicon_txt")
	.text("SELECT A GYRE")
	.attr("class","helplabel");	
svg.append("text")
	.attr("id","arrowicon2_txt")
	.text("SELECT A SOURCE")
	.attr("class","helplabel");			
//sankey legend	
svg.append("text")
	.attr("id","sankeylgnd1")
	.text("Gyres by Size")
	.attr("class","sankeylegend");	
svg.append("text")
	.attr("id","sankeylgnd2")
	.text("Areas by plastic debris")
	.attr("class","sankeylegend");	

drawIcon();	

$("#arrowicon2").hide();	
$('#arrowicon2_txt').hide();
$('#sankeylgnd2').hide();	
	
//CONTOURMAP parent Objct
	contourmap=svgmap.append("g")
		.style("cursor","pointer");
	landmap=svgmap.append("g")
		.style("cursor","pointer");
	currentmap=svgmap.append("g")
		.style("cursor","pointer");	
	releasemap=svgmap.append("g")
		.style("cursor","pointer");
	
//D3 PROJECTION
	xym = d3.geo.azimuthal()
	.mode('orthographic')
	.origin([-20,0]);
	
//PATH & CIRCLE FUNCTIONS
	path = d3.geo.path().projection(xym);
	circle = d3.geo.greatCircle()
		.origin(xym.origin());
	line = d3.svg.line()
    .interpolate("basis")
    .x(function(d, i) { return proj[i][0] })
    .y(function(d, i) { return proj[i][1] });	
	
	
			
// LOAD TEXTURE
	d3.json( 'resources/Plastic.json' , function (json) {
	// CONTOURFILL MAP
	feature=contourmap.selectAll("path")   
		.data(json.features)      
		.enter().append("svg:path")
		.attr("d", clip)
		.attr("class","plastic");	
	});
			
// LOAD RELEASE
	d3.json("resources/release.json.js", function(json) {

	release=releasemap.selectAll("circle")
		.data(json.release)
		.enter().append("circle")
		.attr("class","release")
		.attr("fill",function(d){ return getReleaseColor(d.properties.pol); });
	refresh();	
	});	
	
				
// LOAD LAND
	d3.json("resources/world-countries.json.js", function(collection) {
	  land = landmap.selectAll("path")
		  .data(collection.features)
		.enter().append("svg:path")
		  .attr("d", clip)
		  .attr("class","land");
	});	
	
// LOAD CURRENT
	d3.json("resources/OceanCurrent.json.js", function(collection) {
	  current = currentmap.selectAll("path")
		  .data(collection.features)
		.enter().append("svg:path")
		  .attr("d", clip)
		  .attr("class","current");
	});	
								
// LOAD SANKEY
	d3.json("resources/gyre.json.js", function(json) {
	  gyre=json
	  sankey
		  .nodes(gyre.nodes)
		  .links(gyre.links)
		  .layout(1);

	  link = svg.append("g").selectAll(".link")
		  .data(gyre.links)
		.enter().append("path")
		  .attr("class", "link")
		  .style("stroke", "")
		  .attr("data-target", function(d) { return d.target.id; })
		  .attr("data-source", function(d) { return d.source.id; })
		  .attr("d", sankeypath)
		  .style("stroke-width", function(d) { return Math.max(1, d.dy); })
		  .sort(function(a, b) { return b.dy - a.dy; });

	  link.append("title")
		  .text(function(d) { return d.source.name + " → " + d.target.name + "\n" + format(d.value); });

	  node = svg.append("g").selectAll(".node")
		  .data(gyre.nodes)
		.enter().append("g")
		  .attr("class", "node")
		  .attr("data-type",function(d) { return d.type; })
		  .attr("data-node", function(d) { return d.id; })
		  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

	  node.append("rect")
		  .attr("height", function(d) { return d.dy; })
		  .attr("width", sankey.nodeWidth())
		  .style("fill", function(d) { return d.color; })
		  .style("stroke", "#f6f6f2")
		  .style("stroke-width", "1")
		  .on("click", function(d) {selectNode(d,$(this)) })
		  .on("tap", function(d) {selectNode(d,$(this)) })
		.append("title")
		  .text(function(d) { return d.name + "\n" + format(d.value); });
	 
	  labels = svg.append("g").selectAll("text")
		    .data(gyre.nodes)
		  .enter().append("g")
            .attr("class", "label")
		  .attr("data-type",function(d) { return d.type; })            
            .attr("data-node", function(d) { return d.id; })            
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
            
      labels.append("text")
              .attr("x", -6)
              .attr("y", function(d) { return d.dy / 2; })
              .attr("dy", ".35em")
              .attr("text-anchor", "end")
              .style("font-size",(width/40)+"px")
              .text(function(d) { return d.name; })
		  .on("click", function(d) {selectNode(d,$(d3.selectAll('g.node[data-node="'+$(this).parent().data("node")+'"] rect')[0])) })
		  .on("tap", function(d) {selectNode(d,$(this)) })   
            .filter(function(d) { return d.x > width / 2; })
              .attr("x", 6 + sankey.nodeWidth())
              .attr("text-anchor", "start");

         $('.switch-map').on("click",function(e){e.preventDefault();view="map";switchView()})
         $('.switch-source').on("click",function(e){e.preventDefault();view="san";switchView()})
		  
//Init Sankey	  
	$(".link").hide();
	d3.selectAll('*[data-type="land"]').style("display","none");	  
	});	
			
				
	

//INIT
$(window).on("throttledresize", function( event ) { smartWrap() });
$(window).resize(smartWrap);		
smartWrap();

});			



function selectNode(d,obj) {
    var color=obj.css("fill");
	node.selectAll("rect").style("fill", function(d) { return d.color; })

	if (view=="san"){

        nodeID = obj.parent().data("node");

		if (d.type=="land" & selection!="land"){
			d3.selectAll(".link").style("stroke-opacity",.02)
								.style("stroke","#000000");
			selection="land";
		}
		if (d.type!="land" & selection=="land"){
			d3.selectAll(".link").style("stroke-opacity",.02)
								.style("stroke","#000000");
                selection="sea";
		}
		d3.selectAll('*[data-target="'+nodeID+'"]') //Seas
			.style("stroke",function(d) {
				return $(this).css("stroke-opacity")<0.5 ? d.source.color : "#000000";})
			.style("stroke-opacity",function(d) {
				return $(this).css("stroke-opacity")<0.5 ? 0.7 : .02;});
		d3.selectAll('*[data-source="'+nodeID+'"]') //Land
			.style("stroke",function(d) {
				return $(this).css("stroke-opacity")<0.5 ? d.source.color : "#000000";})
			.style("stroke-opacity",function(d) {
				return $(this).css("stroke-opacity")<0.5 ? 0.7 : .02;});
	}else{
        /*if (obj.css("fill")==d.color){            
            obj.css("fill","#2F6E7A");
        }else{
            obj.css("fill",d.color);
        }*/
        if (color=="#2F6E7A" || color=="rgb(47, 110, 122)"){            
            obj.css("fill",d.color);
        }else{
            obj.css("fill","#2F6E7A");
        }
        
		xym.origin([d.lon,d.lat]);
		circle.origin([d.lon,d.lat])
		rotateView()

	};			
}



var proj=[];	
function smoothclip(d) {
	proj=[];
	
	if(circle.clip(d)){
		var dd=circle.clip(d);
		for ( var i = 0; i < dd.geometry.coordinates.length; i++ ) {
		  proj[i]=xym(dd.geometry.coordinates[i]);
		}
	return line(proj)
	}
}

function clip(d) {
	return path(circle.clip(d))
}		

function mousedown() {
  m0 = [d3.event.pageX, d3.event.pageY];
  o0 = xym.origin();
  d3.event.preventDefault();
}



function mousemove() {
  if (m0) {
    var m1 = [d3.event.pageX, d3.event.pageY],
        o1 = [o0[0] + (m0[0] - m1[0]) / 4, o0[1] + (m1[1] - m0[1]) / 4];
    xym.origin(o1);
    circle.origin(o1)
    rotateView();
  }
}

function mouseup() {
  if (m0) {
    m0 = null;
  }
}

function touchdown() {
  m0 = [d3.event.pageX, d3.event.pageY];
  o0 = xym.origin();
  d3.event.preventDefault();
  $(".plastic").hide()
  $(".release").hide()
}
function touchmove() {
  if (m0) {
    var m1 = [d3.event.pageX, d3.event.pageY],
        o1 = [o0[0] + (m0[0] - m1[0]) / 4, o0[1] + (m1[1] - m0[1]) / 4];
    xym.origin(o1);
    circle.origin(o1)
    rotateLand();
  }
}
function touchup() {
  if (m0) {
    m0 = null;
	rotateView();
	$(".plastic").fadeIn('fast')
  $(".release").fadeIn('fast')
  }
  
}

function refresh() {
	
	var a=height;
	d3.selectAll("svg").attr("width", width + margin.left + margin.right)
						.attr("height", height + margin.top + margin.bottom);
	svg.attr("width", width)
	   .attr("height", height)
	   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    sankey.nodeWidth(3/2*width/24)
		.size([width, height]);
		
	//REFRESH ICON DISPLAY
	$('#mapicon_bgrnd')
		.attr("width",margin.top/1.8)
		.attr("height",margin.top/1.8)
		.attr("x",width-margin.top/1.8)
		.attr("y",-margin.top);
	$('#sankicon_bgrnd')
		.attr("width",margin.top/1.8)
		.attr("height",margin.top/1.8)
		.attr("x",width)
		.attr("y",-margin.top);	
	$('#mapicon')
		.attr("transform","translate("+(width-margin.top/1.8+margin.top/12+margin.top/48)+
									","+(-margin.top+margin.top/24+margin.top/96)+")scale("+width/480+")");
	$('#sankicon')
		.attr("transform","translate("+(width+margin.top/12+margin.top/48)+
									","+(-margin.top+margin.top/24+margin.top/96)+")scale("+width/480+")");									
	$('#mapicon_txt')
		.attr("x",width-margin.top/1.8/2)
		.attr("y",-margin.top/2)
		.attr("style","font-size:"+(width/45)+"px;");	
	$('#sankicon_txt')
		.attr("x",width+margin.top/1.8/2)
		.attr("y",-margin.top/2)
		.attr("style","font-size:"+(width/45)+"px;");	
	$('#mapicon_line')
		.attr("x1",width-margin.top/1.8/2-margin.top/1.8/2*7/12)
		.attr("y1",-margin.top/2.1)
		.attr("x2",width-margin.top/1.8/2+margin.top/1.8/2*7/12)
		.attr("y2",-margin.top/2.1);
	$('#sankicon_line')
		.attr("x1",width+margin.top/1.8/2-margin.top/1.8/2*3/4)
		.attr("y1",-margin.top/2.1)
		.attr("x2",width+margin.top/1.8/2+margin.top/1.8/2*3/4)
		.attr("y2",-margin.top/2.1);	
	$('#sankicon_line').hide();	
	$('#rotateicon')
		.attr("transform","translate("+(width-2*margin.right+margin.top/4)+
									","+(-margin.top/4)+")scale("+width/480+")");										
	$('#rotateicon_txt')
		.attr("x",width-2*margin.right+2.2*margin.top/4)
		.attr("y",-margin.top/8)
		.attr("style","font-size:"+(width/50)+"px;");	
	$('#arrowicon')
		.attr("transform","translate("+(width-sankey.nodeWidth()+1/4*sankey.nodeWidth())+
									","+(-margin.top/4)+")scale("+width/480+")");	
	$('#arrowicon_txt')
		.attr("x",width-2/2*sankey.nodeWidth()+5/6*margin.top/4)
		.attr("y",-margin.top/8)
		.attr("style","font-size:"+(width/50)+"px;");
	$('#arrowicon2')
		.attr("transform","translate("+(1/4*sankey.nodeWidth())+
									","+(-margin.top/4)+")scale("+width/480+")");
	$('#arrowicon2_txt')
		.attr("x",5/6*margin.top/4)
		.attr("y",-margin.top/8)
		.attr("style","font-size:"+(width/50)+"px;");	

	$('#sankeylgnd1')
		.attr("x",width-3/2*sankey.nodeWidth()+5/6*margin.top/4)
		.attr("y",height+3*margin.bottom/4)
		.attr("style","font-size:"+(width/40)+"px;");
	$('#sankeylgnd2')
		.attr("x",-1/2*sankey.nodeWidth()+5/6*margin.top/4)
		.attr("y",height+3*margin.bottom/4)
		.attr("style","font-size:"+(width/40)+"px;");
	
	if (view=="map"){
		$("#arrowicon2").hide();	
		$('#arrowicon2_txt').hide();
		$('#sankeylgnd2').hide();	
	}else{
		$("#rotateicon").hide();	
		$('#rotateicon_txt').hide();
	}

	
	//REFRESH MAP	
	
	xym.translate([width/2-margin.left,height/2])
		.scale(280*a/600);
		
	$('#backsphere').attr("transform","translate("+(width/2-margin.left)+","+height/2+")")
			.attr("r",280*a/600);
			
	rotateView();
	
	
	//REFRESH SANKEY
	if (typeof(sankey) != "undefined" && typeof(gyre) != "undefined" ) {
        sankey	
            .nodes(gyre.nodes)
            .links(gyre.links)
            .layout(1);
        }
	d3.selectAll(".link").attr("d", sankeypath)
			.style("stroke-width", function(d) { return Math.max(1, d.dy); })
			.sort(function(a, b) { return b.dy - a.dy; });

	d3.selectAll(".node").attr("transform", function(d) { 
            return "translate(" + d.x + "," + d.y + ")"; })

	d3.selectAll(".node rect").attr("height", function(d) { return d.dy; })
		  .attr("width", sankey.nodeWidth());
	
    d3.selectAll(".label").attr("transform", function(d) { 
            return "translate(" + d.x + "," + d.y + ")"; })
    
	d3.selectAll(".label text")
		  .style("font-size",(width/40)+"px")
		  .attr("x", -6)
		  .attr("y", function(d) { return d.dy / 2; })
		.filter(function(d) { return d.x > width / 2; })
		  .attr("x", 6 + sankey.nodeWidth());
	//$("body").css("font-size",(width/50)+"px")
	
}

function smartWrap(){

    height = $(window).height() - $('#map').offset().top
	width=$('#map').width();
	
	if (width/height>6/5 && width > 767){
		width=6/5*height
	}else{
		height=5/6*width;
	}
	

	margin = {top: width/6, right: width/6, bottom: width/24, left: width/6};
	width = width - margin.left - margin.right,
    height = height - margin.top - margin.bottom;	
	
	refresh()	
}

function rotateView(){
	rotateFeature();
	rotateLand();
}

function rotateLand(){
    if (land) {
        land.attr("d", clip);
    }
	if (current) {
        current.attr("d", clip);
    }
}

function rotateFeature(){
	
    if (release) {
        release.attr("r", height/280)
        .attr('transform', function (d) { 
            if (clip(d)){
                return "translate(" + xym(d.geometry.coordinates) + ")"; 
            }else{
                return "translate("+(-2*width)+",0)"; 
            }
        });
    }
	if (feature) {
        feature.attr("d", clip);
    }
}

function switchView(){
	node.selectAll("rect").style("fill", function(d) { return d.color; })
	if (view=="map"){
        $(".switch-map").hide();
        $(".switch-source").show();
		$(".link").hide();
		d3.selectAll('*[data-type="land"]').style("display","none");
		$("#svgmap").show();
		$("#subtitle_map").show();
		$(".intro_map").show();
		$(".key").show();
		$("#subtitle_sankey").hide();
		$(".intro_sankey").hide();
		$("#mapicon_bgrnd").attr("class","selectIcon selectIcon_on");
		$("#sankicon_bgrnd").attr("class","selectIcon");
		$('#mapicon_line').show();	
		$('#sankicon_line').hide();	
		$("#rotateicon").show();	
		$('#rotateicon_txt').show();		
		$("#arrowicon2").hide();	
		$('#arrowicon2_txt').hide();
		$('#sankeylgnd2').hide();
		view="map";
	}else{
        $(".switch-map").show();
        $(".switch-source").hide();    
		$(".link").show();
		d3.selectAll('*[data-type="land"]').style("display","inline");
		$("#svgmap").hide();
		$("#subtitle_map").hide();
		$(".intro_map").hide();
		$(".key").hide();
		$("#subtitle_sankey").show();
		$(".intro_sankey").show();
		$("#mapicon_bgrnd").attr("class","selectIcon");
		$("#sankicon_bgrnd").attr("class","selectIcon selectIcon_on");
		$('#mapicon_line').hide();	
		$('#sankicon_line').show();
		$("#rotateicon").hide();	
		$('#rotateicon_txt').hide();		
		$("#arrowicon2").show();	
		$('#arrowicon2_txt').show();
		$('#sankeylgnd2').show();
		view="san";
	}
}

function getReleaseColor(pol){
	switch(Math.round(pol/0.05))
	{
	case 0:
		return "#F6EC1F"
		break;
	case 1:
		return "#F0BF1A"
		break;
	case 2:
		return "#EA7D24"
		break;
	case 3:
		return "#db5416"
		break;
	case 4:
		return "#db0a16"
		break;  
	default:
		return "#db0a16"
		break; 
	}
}

function drawIcon(){
//MAPICON
		d3.select("#mapicon").append("circle")
			.attr("fill","none")
			.attr("stroke","#000000") 
			.attr("stroke-width",3) 
			.attr("stroke-miterlimit",10) 
			.attr("cx",21.26)
			.attr("cy",21.26)
			.attr("r",19);
		d3.select("#mapicon").append("line")
			.attr("fill","none")
			.attr("stroke","#000000") 
			.attr("stroke-width",3) 
			.attr("stroke-miterlimit",10) 
			.attr("x1",21.259) 
			.attr("y1",2.26) 
			.attr("x2",21.259)
			.attr("y2",40.26);
		d3.select("#mapicon").append("line")
			.attr("fill","none")
			.attr("stroke","#000000") 
			.attr("stroke-width",2) 
			.attr("stroke-miterlimit",10) 
			.attr("x1",2.259) 
			.attr("y1",21.26) 
			.attr("x2",40.26)
			.attr("y2",21.26); 
		d3.select("#mapicon").append("line")
			.attr("fill","none")
			.attr("stroke","#000000") 
			.attr("stroke-width",2) 
			.attr("stroke-miterlimit",10) 
			.attr("x1",3.843) 
			.attr("y1",11.76) 
			.attr("x2",38.181)
			.attr("y2",11.76); 
		d3.select("#mapicon").append("line")
			.attr("fill","none")
			.attr("stroke","#000000") 
			.attr("stroke-width",2) 
			.attr("stroke-miterlimit",10) 
			.attr("x1",4.634) 
			.attr("y1",30.761) 
			.attr("x2",37.909)
			.attr("y2",30.761); 
		d3.select("#mapicon").append("path")
			.attr("fill","none")
			.attr("stroke","#000000") 
			.attr("stroke-width",3) 
			.attr("stroke-miterlimit",10) 
			.attr("d","M21.259,2.26c0,0-9.5,5.739-9.5,19s9.5,19,9.5,19"); 
		d3.select("#mapicon").append("path")
			.attr("fill","none")
			.attr("stroke","#000000") 
			.attr("stroke-width",3) 
			.attr("stroke-miterlimit",10) 
			.attr("d","M21.259,2.26c0,0,9.501,5.739,9.501,19s-9.501,19-9.501,19"); 
//SANKICON
	d3.select("#sankicon").append("path")
			.attr("d","M6.931,13.401c0,0.696-0.57,1.266-1.268,1.266H3.975c-0.696,0-1.267-0.569-1.267-1.266V5.637c0-0.696,0.57-1.266,1.267-1.266h1.688c0.697,0,1.268,0.569,1.268,1.266V13.401z");
	d3.select("#sankicon").append("path")
			.attr("d","M6.931,25.106c0,0.697-0.57,1.267-1.268,1.267H3.975c-0.696,0-1.267-0.569-1.267-1.267v-7.762c0-0.697,0.57-1.268,1.267-1.268h1.688c0.697,0,1.268,0.57,1.268,1.268V25.106z");
	d3.select("#sankicon").append("path")
			.attr("d","M6.931,36.882c0,0.696-0.57,1.267-1.268,1.267H3.975c-0.696,0-1.267-0.57-1.267-1.267V29.12c0-0.696,0.57-1.267,1.267-1.267h1.688c0.697,0,1.268,0.57,1.268,1.267V36.882z");
	d3.select("#sankicon").append("path")
			.attr("d","M39.811,13.401c0,0.696-0.569,1.266-1.267,1.266h-1.689c-0.696,0-1.266-0.569-1.266-1.266V5.637c0-0.696,0.569-1.266,1.266-1.266h1.689c0.697,0,1.267,0.569,1.267,1.266V13.401z");
	d3.select("#sankicon").append("path")
			.attr("d","M39.811,25.106c0,0.697-0.569,1.267-1.267,1.267h-1.689c-0.696,0-1.266-0.569-1.266-1.267v-7.762c0-0.697,0.569-1.268,1.266-1.268h1.689c0.697,0,1.267,0.57,1.267,1.268V25.106z");
	d3.select("#sankicon").append("path")
			.attr("d","M39.811,36.882c0,0.696-0.569,1.267-1.267,1.267h-1.689c-0.696,0-1.266-0.57-1.266-1.267V29.12c0-0.696,0.569-1.267,1.266-1.267h1.689c0.697,0,1.267,0.57,1.267,1.267V36.882z");
	d3.select("#sankicon").append("path")
			.attr("fill","none") 
			.attr("stroke","#000000")
			.attr("stroke-width",3)
			.attr("stroke-miterlimit",10)
            .attr("d","M5.031,21.226c0,0,36.1,0,32.67,0");
	d3.select("#sankicon").append("path")
			.attr("fill","none") 
			.attr("stroke","#000000") 
			.attr("stroke-width",3) 
			.attr("stroke-miterlimit",10) 
			.attr("d","M38.544,21.206c-12.508,0-14.408-11.777-31.719-11.777");
	d3.select("#sankicon").append("path")
			.attr("fill","none") 
			.attr("stroke","#000000") 
			.attr("stroke-width",3) 
			.attr("stroke-miterlimit",10) 
			.attr("d","M38.123,21.569c-12.508,0-14.408,11.776-31.72,11.776");
// ROTATE ICON
	d3.select("#rotateicon").append("path")
			.attr("fill","#C4C2B7")
			.attr("d","M18.968,14.173l7.016,9.316l7.013-9.316h-4.215v0c0-7.654-6.228-13.881-13.882-13.881c-7.653,0-13.88,6.227-13.88,13.881c0,7.655,6.227,13.882,13.88,13.882c3.001,0,5.859-0.943,8.266-2.729l-3.336-4.498c-1.435,1.064-3.14,1.627-4.93,1.627c-4.565,0-8.28-3.716-8.28-8.283c0-4.566,3.715-8.281,8.28-8.281c4.566,0,8.282,3.715,8.282,8.281v0H18.968z");
// ARROW DOWN
	d3.select("#arrowicon").append("polygon")
			.attr("fill","#C4C2B7")
			.attr("points","10.031,18.825 10.031,0.204 4.031,0.204 4.031,18.825 0.072,18.825 7.087,28.143 14.101,18.825");
	d3.select("#arrowicon2").append("polygon")
			.attr("fill","#C4C2B7")
			.attr("points","10.031,18.825 10.031,0.204 4.031,0.204 4.031,18.825 0.072,18.825 7.087,28.143 14.101,18.825");
}
