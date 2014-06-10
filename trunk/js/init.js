var wsImpl = window.WebSocket || window.MozWebSocket;
var mainToolbox;

document.addEvent('domready', function(){
	//initPi();
	
	$('gogoMonitor').dispose().inject('content_gogomon');
	initSpatial();
	startWebSocket();
});


function initMappingPreview(updateFunc) {
  updateMappingPreview.updateFunc = updateFunc;
  //updateMappingPreview();
  updateMappingPreview.updateFunc('<xml></xml>');
}

function updateMappingPreview() {
  if (updateMappingPreview.updateFunc) {
    var code = document.getElementById('languagePre').textContent;
    updateMappingPreview.updateFunc(xmlText);
  }
}

function initGraphPreview(updateFunc) {
  updateGraphPreview.updateFunc = updateFunc;
  //updateGraphPreview();
  updateGraphPreview.updateFunc('<xml></xml>');
}

function updateGraphPreview() {
  if (updateGraphPreview.updateFunc) {
    var code = document.getElementById('languagePre').textContent;
    updateGraphPreview.updateFunc(xmlText);
  }
}

var blockSpatial = new Class({
	initialize: function(){
		var that = this;
		
		that = new Element('div', {'class': 'spatialBlock', 'html': '<div data-type="title" class="title"></div><div data-type="var1" class="var1"></div><div data-type="var2" class="var2"></div>'});
		
		
		that.setTitle = function(text){
			that.getElement('.title').set('text', text);
			that.title = text;			
		}
		
		that.setVar1 = function(text){
			that.getElement('.var1').set('text', text);
			that.var1 = text;
		}
		
		that.setVar2 = function(text){
			that.getElement('.var2').set('text', text);
			that.var2 = text;
		}
		
		that.addEvent('click', function(){
			if (!that.hasClass('selected')) {
				that.getParent('.contentSpatial').getElements('.spatialBlock').removeClass('selected');
				that.addClass('selected');
				that.getParent('.contentSpatial').fireEvent('selectBlock', that);
			}
		});
		
		that.getElements('div').addEvent('click', function(event){
			var item = this;
			if (!item.hasClass('selected')) {
				var text = item.get('text');
				item.set('html', '<input type="text" value="'+text+'">');
				item.getFirst().addEvent('blur', function(){
					item.getParent('.contentSpatial').fireEvent('changeBlockContent', item);
					var newText = this.get('value');
					setTimeout(function(){
						item.set('html', newText);
					}, 20);
					item.removeClass('selected');
					that[item.get('data-type')] = newText;
				});
				item.addClass('selected');
				item.getFirst().select();
			}
			//event.stop();
		});
		
		return that;
	}
});

var mappingBlock = new Class({
	Extends: blockSpatial,
	initialize: function(){
		var that = this.parent();
		
		that.addClass('mappingBlock');
		
		that.setTitle('convertYtoX');
		that.setVar1('y');
		
		that.points = [{'x': 0, 'y': 400}, {'x': 400, 'y': 0}];
		
		that.xmlText = '<block type="procedures_defreturn" inline="false"><mutation><arg name="[VAR1]"></arg></mutation><field name="NAME">[TITLE]</field><statement name="STACK"><block type="controls_if" inline="false"><mutation elseif="0"></mutation><value name="IF0"><block type="logic_compare" inline="true"><field name="OP">LT</field><value name="A"><block type="variables_get"><field name="VAR">[VAR1]</field></block></value><value name="B"><block type="math_number" ><field name="NUM">1000</field></block></value></block></value><statement name="DO0"><block type="variables_set" inline="true"><field name="VAR">x</field><value name="VALUE"><block type="math_arithmetic" inline="true"><field name="OP">ADD</field><value name="A"><block type="math_arithmetic" inline="true"><field name="OP">DIVIDE</field><value name="A"><block type="math_arithmetic" inline="true"><field name="OP">MINUS</field><value name="A"><block type="variables_get"><field name="VAR">[VAR1]</field></block></value><value name="B"><block type="math_number" ><field name="NUM">0</field></block></value></block></value><value name="B"><block type="math_number"><field name="NUM">1</field></block></value></block></value><value name="B"><block type="math_number"><field name="NUM">0</field></block></value></block></value></block></statement></block></statement><value name="RETURN"><block type="variables_get"><field name="VAR">x</field></block></value></block>';
		
		return that;
	}
});


var initSpatial = function(){
	
	
	mainToolbox = $('toolbox');
	
	var mapping = $('spatialContentTemplate').clone();
	mapping.set('id', 'mappingMainArea').inject($('content_cvi'));
	
	mapping.content = {
		'title': 'convertXtoY',
		'var1': 'y'
	};
	
	mapping.data = [];
	mapping.storage = window.localStorage.getItem('mappingBlock');
	if (mapping.storage) {
		var dataArr = mapping.storage.split('::');
		var testBlock;
		dataArr.each(function(item, index){
			var itemArr = item.split('||');
			var blockData = itemArr[0].split(';;');
			var spatialData = itemArr[1].split(';;');
			mapping.data.push({'block': itemArr[0], 'spatial': itemArr[1]});
			testBlock = new mappingBlock();
			testBlock.setTitle(blockData[0]);
			testBlock.setVar1(blockData[1]);
			testBlock.inject(mapping.getElement('.procedure'));
			testBlock.blockIndex = index;
			var pointArr = [];
			var pointData;
			spatialData.each(function(item){
				pointData = item.split('#');
				pointArr.push({'x': pointData[0].toInt(), 'y': pointData[1].toInt()});
			});
			testBlock.points = pointArr;
		});
		
		mapping.currentBlock = testBlock;
		mapping.currentData = mapping.data.length - 1;
		setTimeout(function(){
			mapping.currentBlock.fireEvent('click');
			
		}, 10);
	}
	
	mapping.saveData  = function(){
		var dataArr = [];
		kk(mapping.data);
		mapping.data.each(function(item){
			dataArr.push(item.block+'||'+item.spatial);
		});
		mapping.storage = dataArr.join('::');
		kk('save mapping data to storage: ');
		kk(mapping.storage);
		window.localStorage.setItem('mappingBlock', mapping.storage);
	}
	
	mapping.addEvent('selectBlock', function(item){
		mapping.currentBlock = item;
//		var mainArea = $$('#mappingMainArea .wrapper')[0];
//		mainArea.empty();
//		var currentSpatial = new Converter();
//		currentSpatial.inject(mainArea);
		
		//mapping.currentData = mapping.currentBlock.blockIndex;
		var allBlocks = item.getParent().getElements('.mappingBlock');
		mapping.currentData = allBlocks.indexOf(item);
		kk(mapping.currentBlock.points);
		var currentSpatial = mapping.getElement('.wrapper').getFirst();
		
		currentSpatial.setPoints(mapping.currentBlock.points);
	});
	
	mapping.addEvent('changeBlockContent', function(item){
		/***
		alert(item.get('class'));
		if (item.hasClass('title')) {
			mapping.
		}
		/***/
		kk(item);
		setTimeout(function(){
			mapping.updateBlock();
			
			/**  save data to storage  **/
			block = item.getParent('.mappingBlock');
			mapping.data[mapping.currentData].block = block.title+';;'+block.var1;
			mapping.saveData();
		}, 10);
	});
	
	mapping.addEvent('changeGraph', function(item){
		var converter = item;
		var newBlock = converter.YtoXBlockly();
		mapping.currentBlock.xmlText = newBlock;
		mapping.updateBlock();
		mapping.currentBlock.points = converter.points; 
		
		/**  save data to storage  **/
		mapping.data[mapping.currentData].spatial = converter.getTextData();
		mapping.saveData();
		//alert(mapping.currentBlock.points);
	});
	
	
	/***
	var testBlock = new mappingBlock();
	
	testBlock.inject(mapping.getElement('.procedure'));
	//testBlock.fireEvent('click');
	testBlock.addClass('selected');
	mapping.currentBlock = testBlock;
	/***/
	
	
	mapping.getElement('.iframe').set('src', 'mappingPreview.html?ltrqwwq');
	
	//mapping.xml = '';
	
	mapping.updateBlock = function(){
		var block = mapping.currentBlock;
		var xmlText = block.xmlText;
		//alert(xmlText.split('[TITLE]').join(block.title));
		xmlText = xmlText.split('[TITLE]').join(block.title).split('[VAR1]').join(block.var1);
		
		updateMappingPreview.updateFunc('<xml>'+xmlText+'</xml>');
	}
	
	document.addEvent('readSensor', function(rs){
		//kk(rs);
		if (mapping.spatial) {
			if ($('tab_cvi').hasClass('tabon')) {
				
				mapping.spatial.updateSensor(Math.round(rs*1000/1024));
			} else {
				mapping.spatial.hideDashLine();
			}
		} 
	});
	
	setTimeout(function(){
	//window.addEvent('BlocklyIsReady', function(){
		var mainArea = mapping.getElement('.wrapper');
		mainArea.empty();
		var currentSpatial = new Converter();
		currentSpatial.inject(mainArea);
		mapping.spatial = currentSpatial;
		mapping.spatial.setPoints(mapping.currentBlock.points);
		
		if (!mapping.storage) {
			mapping.getElement('.submit').fireEvent('click');
		}
	//});
	}, 1000);
	
	mapping.getElement('.deleteBlock').addEvent('click', function(){
		if (mapping.data.length > 1) {
			var prevBlock = mapping.currentBlock.getPrevious();
			if (mapping.currentData == 0) {
				prevBlock = mapping.currentBlock.getNext();
			}
			var currentData = mapping.data[mapping.currentData];
			mapping.data.erase(currentData);
			mapping.currentBlock.destroy();
			
			mapping.currentData = (mapping.currentData == 0) ? 0 : mapping.currentData - 1;
			
			prevBlock.fireEvent('click');
			mapping.saveData();
		}
	});
	
	mapping.getElement('.submit').addEvent('click', function(){
		var block = new mappingBlock();
		
		block.inject(mapping.getElement('.procedure'));
		block.fireEvent('click');
		mapping.currentBlock = testBlock;
		
		//var block = mapping.currentBlock;
		
		/**  add data for save to storage  **/
		
		mapping.data.push({'block': block.title+';;'+block.var1, 'spatial': ''});
		
		mapping.currentData = mapping.data.length - 1;
		
		/**  update toolbox  **/
		var mappingToolbox = mainToolbox.getElement('.toolMappingBlock');
		var blockID = 'block+'+now();
		var newBlock = new Element('block', {'id': blockID, 'html': '<mutation name="'+block.title+'"><arg name="'+block.var1+'"></arg></mutation>'});
		newBlock.setAttribute('type', 'procedures_callreturn');
		newBlock.inject(mappingToolbox);
		
		Blockly.updateToolbox(mainToolbox);
	});
	
	/***
	mapping.getElement('.submit').addEvent('click', function(){
		var converter = mapping.getElement('.spatial.converter');
		
		var newBlock = converter.YtoXBlockly();
		
		var xmlDom = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
		var xmlText = Blockly.Xml.domToPrettyText(xmlDom).replace('</xml>', '');
		k(newBlock);
		
		//xmlText += newBlock+'</xml>';
		xmlText += '</xml>';
		updateMappingPreview.updateFunc('<xml>'+newBlock+'</xml>');
		
		xmlDom = Blockly.Xml.textToDom(xmlText);
		
		if (xmlDom) {
		  Blockly.mainWorkspace.clear();
		  Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xmlDom);
		}
		
		var mappingToolbox = mainToolbox.getElement('.toolMappingBlock');
		var newBlock = new Element('block', {'html': '<mutation name="convertYtoX"><arg name="y"></arg></mutation>'});
		newBlock.setAttribute('type', 'procedures_callreturn');
		newBlock.inject(mappingToolbox);
		
		Blockly.updateToolbox(mainToolbox);
		
		var newBlockBTN = new Element('div', {'class': 'mappingBlock', 'html': '<div class="title">convertYtoX</div><div class="var1">y</div>'});
		newBlockBTN.inject(mapping.getElement('.procedure'));
		
		//Code.tabClick('blocks');
	});
	/***/
	
	
	
	var graph = $('spatialContentTemplate').clone();
	graph.set('id', 'graphMainArea').inject($('content_cdi'));
	graph.getElement('.iframe').set('src', 'graphPreview.html?ltrqwwq');
	
	graph.getElement('.mainArea p').set('text', 'Graph: ConvertGraph');
	graph.getElement('.procedure p').set('text', 'Graph Blocks');
	var addNewGB = function(){
		
		var currentGraph = graph.getElement('.spatial.graph');
		
		var newBlock = currentGraph.convertToBlockly();
		
		var xmlDom = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
		var xmlText = Blockly.Xml.domToPrettyText(xmlDom).replace('</xml>', '');
		
		xmlText += '</xml>';
		updateGraphPreview.updateFunc('<xml>'+newBlock+'</xml>');
		
		xmlDom = Blockly.Xml.textToDom(xmlText);
		
		if (xmlDom) {
		  Blockly.mainWorkspace.clear();
		  Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xmlDom);
		}
		
		var mappingToolbox = mainToolbox.getElement('.toolGraphBlock');
		var newBlock = new Element('block', {'html': '<mutation name="convertGraph"><arg name="sensor1"></arg><arg name="sensor2"></arg></mutation>'});
		newBlock.setAttribute('type', 'procedures_callreturn');
		newBlock.inject(mappingToolbox);
		
		Blockly.updateToolbox(mainToolbox);
		
		var newBlockBTN = new Element('div', {'class': 'graphBlock', 'html': '<div class="title">convertGraph</div><div class="var1">x</div><div class="var2">y</div>'});
		newBlockBTN.inject(graph.getElement('.procedure'));
		
		
	}
	
	graph.getElement('.submit').addEvent('click', addNewGB);
	
	//Code.tabClick('graph'); 
}

var normalWS = function(){
	var ws = new wsImpl('ws://localhost:8316/ws');
	
	ws.onmessage = function (evt) {
		//console.log(evt.data);
		var resp = evt.data.split('::');
		if(resp[0] == 'burst') {
			$('gogoStatus').addClass('on');
			if($('sensorOptionBTN').hasClass('selected')) {
				var rs = resp[1].split('-');
				document.fireEvent('readSensor', rs);
				for (var i = 0; i < 8; i++) {
					//if(!(Math.abs(rs[i] - rs1[i]) > 950 && Math.abs(rs[i] - rs2[i]) > 950)) {
						$('sensor'+(i+1)).getFirst('.gate').setStyle('height', (100 - (rs[i] / 10.24))+'%');
						$('sensor'+(i+1)).getElements('.sensorValue').set('text', rs[i]);
					//}
				}
			}
		} else if (resp[0] == 'status') {
			if (resp[1]=='success') {
				$('gogoStatus').addClass('on');
			} else if (resp[1]=='disconnect') {
				if ($('sensorOptionBTN').hasClass('selected')) {
					$('sensorOptionBTN').fireEvent('click');
				}
				$('gogoStatus').removeClass('on');
				ws.send(7);
			}
		} else if (resp[0] == 'nodata') {
			$('gogoStatus').removeClass('on');
			for (var i = 0; i < 8; i++) {
				//if(!(Math.abs(rs[i] - rs1[i]) > 950 && Math.abs(rs[i] - rs2[i]) > 950)) {
					$('sensor'+(i+1)).getFirst('.gate').setStyle('height', (100)+'%');
					$('sensor'+(i+1)).getElements('.sensorValue').set('text', '0');
				//}
			}
		}
	};
	
	// when the connection is established, this method is called
	ws.onopen = function () {
		//this.send(6)
		//inc.innerHTML += '.. connection open<br/>';
	};
	
	// when the connection is closed, this method is called
	ws.onclose = function (status) {
		new Element('div', {'id': 'warningMessage', 'class': 'anime12', 'text': 'Connection lost. Reconnecting..'}).inject(document.body);
		setTimeout(function(){
			$('warningMessage').destroy();
			startWebSocket();
		}, 1000);
	}
	return ws;
}

var startWebSocket = function(){
	window.ws = normalWS();
}