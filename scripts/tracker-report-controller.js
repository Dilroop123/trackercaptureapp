/**
 * Created by hisp on 2/12/15.
 */
msfReportsApp.directive('calendar', function () {
    return {
        require: 'ngModel',
        link: function (scope, el, attr, ngModel) {
            $(el).datepicker({
                dateFormat: 'yy-mm-dd',
                onSelect: function (dateText) {
                    scope.$apply(function () {
                        ngModel.$setViewValue(dateText);
                    });
                }
            });
        }
    };
});
msfReportsApp
    .controller('TrackerReportController', function( $rootScope,$scope,$timeout,MetadataService){

        jQuery(document).ready(function () {
            hideLoad();
        })
       $timeout(function(){
            $scope.date = {};
            $scope.date.startDate = new Date();
            $scope.date.endDate = new Date();
        },0);


        getAllPrograms();

        //initially load tree
        selection.load();
        // Listen for OU changes
        selection.setListenerFunction(function(){
            $scope.selectedOrgUnitUid = selection.getSelected();
            loadOU();
        },false);

        loadOU = function(){
            MetadataService.getOrgUnit($scope.selectedOrgUnitUid).then(function(orgUnit){
                $timeout(function(){
                    $scope.selectedOrgUnit = orgUnit;
                  //  $scope.selectedOrgUnitName = orgUnit.name;

                });
            });
        }
        function getAllPrograms (){
            MetadataService.getAllPrograms().then(function(prog) {
                $scope.allPrograms = prog.programs;
                $scope.programs = [];
                for(var i=0; i<prog.programs.length;i++){
                    if(prog.programs[i].withoutRegistration == false){

                        $scope.programs.push(prog.programs[i]);
                    }
                }
                $timeout(function(){

                })
            });
        }

        $scope.updateStartDate = function(startdate){
            $scope.startdateSelected = startdate;
            //  alert("$scope.startdateSelected---"+$scope.startdateSelected);
        };

        $scope.updateEndDate = function(enddate){
            $scope.enddateSelected = enddate;
            //  alert("$scope.enddateSelected---"+ $scope.enddateSelected);
        };

        $scope.fnExcelReport = function(){

            var blob = new Blob([document.getElementById('divId').innerHTML], {
                type: 'text/plain;charset=utf-8'
            });
            saveAs(blob, "Report.xls");

        };

       $scope.generateReport = function(program){
           $scope.selectedOrgUnitName = $scope.selectedOrgUnit.name;
           $scope.selectedStartDate = $scope.startdateSelected;
           $scope.selectedEndDate = $scope.enddateSelected;
           $scope.program = program;

           for(var i=0; i<$scope.program.programTrackedEntityAttributes.length;i++){
               var str = $scope.program.programTrackedEntityAttributes[i].displayName;
               var n = str.lastIndexOf('-');
               $scope.program.programTrackedEntityAttributes[i].displayName = str.substring(n + 1);

           }
		   $scope.teiList =[];
		   		   $scope.eventList =[];

               $scope.psDEs = [];
           $scope.Options =[];
           $scope.attribute = "Attributes";
           $scope.org = "Organisation Unit : ";
           $scope.enrollment =["Enrollment date" , "Enrolling orgUnit"];
           $scope.start = "Start Date : ";
           $scope.end = "End Date : ";
           var options = [];

           var index=0;
           for (var i=0;i<$scope.program.programStages.length;i++){

               var psuid = $scope.program.programStages[i].id;
               $scope.psDEs.push({dataElement : {id : "orgUnit",name : "orgUnit",ps:psuid}});
               $scope.psDEs.push({dataElement : {id : "eventDate",name : "eventDate",ps:psuid}});

               for (var j=0;j<$scope.program.programStages[i].programStageDataElements.length;j++){

                       $scope.program.programStages[i].programStageDataElements[j].dataElement.ps = psuid;
                   var de =$scope.program.programStages[i].programStageDataElements[j];
                       $scope.psDEs.push(de);

                   if ($scope.program.programStages[i].programStageDataElements[j].dataElement.optionSet != undefined) {
                       if ($scope.program.programStages[i].programStageDataElements[j].dataElement.optionSet.options != undefined) {

                           for (var k = 0; k < $scope.program.programStages[i].programStageDataElements[j].dataElement.optionSet.options.length; k++) {
                               index=index+1; // $scope.Options.push($scope.program.programStages[i].programStageDataElements[j]);
                               var code = $scope.program.programStages[i].programStageDataElements[j].dataElement.optionSet.options[k].code;
                               var name = $scope.program.programStages[i].programStageDataElements[j].dataElement.optionSet.options[k].displayName;

                               options.push({code:code,name:name});
                               $scope.Options[$scope.program.programStages[i].programStageDataElements[j].dataElement.optionSet.options[k].code + "_index"] = $scope.program.programStages[i].programStageDataElements[j].dataElement.optionSet.options[k].displayName;
                           }
                       }
                   }
				  
                   }
				   


               }
                 var store=[$scope.Options];
				  // console.log(store);
              var psdes=[$scope.psDEs];
			 // console.log(psdes);
         //  var param = "var=program:"+program.id + "&var=orgunit:"+$scope.selectedOrgUnit.id+"&var=startdate:"+moment($scope.date.startDate).format("YYYY-MM-DD")+"&var=enddate:"+moment($scope.date.endDate).format("YYYY-MM-DD");
           var param = "var=program:"+program.id + "&var=orgunit:"+$scope.selectedOrgUnit.id+"&var=startdate:"+$scope.startdateSelected+"&var=enddate:"+$scope.enddateSelected;

                    MetadataService.getSQLView(SQLViewsName2IdMap[SQLQUERY_TEI_DATA_VALUE_NAME], param).then(function (stageData) {
                        $scope.stageData = stageData;
                                   //  var aa =Options;
                        MetadataService.getSQLView(SQLViewsName2IdMap[SQLQUERY_TEI_ATTR_NAME], param).then(function (attrData) {
                            $scope.attrData = attrData;

                            MetadataService.getEnrollmentsBetweenDateProgramAndOu($scope.selectedOrgUnit.id,$scope.program.id,$scope.startdateSelected,$scope.enddateSelected).then(function(allenrollments){
                                $scope.allenrollments = allenrollments;
								
								//----------------------------
								
								
								
								var aa=5;
								var worker_fn = function(e) 
								{
									
									var args = e.data.args;
								  var stageData = e.data.args[0];

								   var attrData = e.data.args[1];
								
									var allenrollments = e.data.args[2];
								
								  var storeee=e.data.args[3];
								
								    var psdes=e.data.args[4];
								 
								  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
																	arrangeDataX(stageData,attrData,allenrollments,storeee,psdes);
										   function arrangeDataX(stageData,attrData,allenrollments,storeee,psdes){//////////////////////////////////////////////////////////////////////////////////////

													
										   
										   
												var report = [{
													teiuid : ""
												}]

												var teiWiseAttrMap = [];
												var attrMap = [];
												var teiList = [];
												var eventList = [];
											  var maxEventPerTei = [];

												var teiEnrollOrgMap = [];
												var teiEnrollMap =[];

												var teiPsMap = [];
												var teiPsEventMap = [];
												var teiPsEventDeMap = [];
												var teiEventMap = [];


												// For attribute
												const index_tei = 0;
												const index_attruid = 2;
												const index_attrvalue = 3;
												// const index_attrname = 4;
												const index_ouname = 4;
												const index_enrollmentDate = 6;

												// For Data values
												const index_deuid = 5;
												const index_devalue = 7;
												const index_ps = 1;
												const index_ev = 3;
												const index_evDate = 4;
												const index_ou = 8;

												for (var i=0;i<attrData.height;i++){
													var teiuid = attrData.rows[i][index_tei];
													var attruid = attrData.rows[i][index_attruid];
													var attrvalue = attrData.rows[i][index_attrvalue];
													var ouname = attrData.rows[0][index_ouname];
													var enrollDate = attrData.rows[i][index_enrollmentDate]; // enrollment date
													enrollDate = enrollDate.substring(0, 10);
													if (teiWiseAttrMap[teiuid] == undefined){
														teiWiseAttrMap[teiuid] = [];
													}
													teiWiseAttrMap[teiuid].push(attrData.rows[i]);
													
													attrMap[teiuid+"-"+attruid] = attrvalue;

													teiEnrollMap[teiuid+"-enrollDate"] = enrollDate;

													for (var k=0; k< allenrollments.enrollments.length;k++) {
														if (allenrollments.enrollments[k].trackedEntityInstance == attrData.rows[i][0]) {
															teiEnrollOrgMap[teiuid + "-ouname"] = allenrollments.enrollments[k].orgUnitName;
														}
													}
												//    $scope.teiEnrollOrgMap[teiuid + "-ouname"] = ouname;
												         var storeeee=storeee[0];
													for(m in storeeee){

														if(attrvalue+'_index' == m){

															attrMap[teiuid+"-"+attruid] = storeeee[m];
														}

													}

												}

												for (key in teiWiseAttrMap){
													teiList.push({teiuid : key});
												   attrMap =attrMap;
												}

												/*$timeout(function(){
												$scope.teiList = $scope.teiList;
													})*/
												
												
											prepareListFromMap= function(map){
												var list = [];
												for (var key in map){
													list.push(map[key]);
												}
												
												return list;
											}
                                               teis = prepareListFromMap(teiWiseAttrMap);
											   
												var teiPerPsEventListMap = [];
												var teiToEventListMap = [];
												var eventToMiscMap = [];
													eventToMiscMap["dummy"] = {ou : "" , evDate : ""};
												var teiList = [];
												for (var i=0;i<stageData.height;i++) {
													var teiuid = stageData.rows[i][index_tei];
													var psuid = stageData.rows[i][index_ps];
													var evuid = stageData.rows[i][index_ev];
													var evDate = stageData.rows[i][index_evDate];
													evDate = evDate.substring(0, 10);
													var deuid = stageData.rows[i][index_deuid];
													var devalue = stageData.rows[i][index_devalue];
													var ou = stageData.rows[i][index_ou];

													if (!teiList[teiuid]){
														teiList[teiuid] = true;
													}
													if (!teiPerPsEventListMap[teiuid]) {
														teiPerPsEventListMap[teiuid] = [];
														teiPerPsEventListMap[teiuid].max = 0;
													}

													if (!teiPerPsEventListMap[teiuid][psuid]) {
														teiPerPsEventListMap[teiuid][psuid] = [];

													}

													if (!teiToEventListMap[evuid]) {
														teiToEventListMap[evuid] = true;
														teiPerPsEventListMap[teiuid][psuid].push(evuid);
														if (teiPerPsEventListMap[teiuid][psuid].length > teiPerPsEventListMap[teiuid].max) {
															teiPerPsEventListMap[teiuid].max = teiPerPsEventListMap[teiuid][psuid].length;
														}
													}

													if (!teiPsEventMap[teiuid + "-" + psuid + "-" + evuid]){
														teiPsEventMap[teiuid + "-" + psuid + "-" + evuid] = [];
													}

													eventToMiscMap[evuid] = {ou : ou , evDate : evDate};
													teiPsEventDeMap[teiuid + "-" + evuid + "-" + deuid] = devalue;
												}
													var TheRows = [];
													var psDes = psdes[0];
												

													for (key in teiList){
														var teiuid = key;
														eventList[teiuid] = [];

														var maxEventCount = teiPerPsEventListMap[teiuid].max;

														if (maxEventCount == 0){debugger}
														for (var y=0;y<maxEventCount;y++){

															TheRows = [];
															for (var x=0;x<psDes.length;x++){
															
															var psuid = psDes[x].dataElement.ps;
													
															var deuid = psDes[x].dataElement.id;
																var evuid = undefined;
																if (teiPerPsEventListMap[teiuid][psuid]){
																	 evuid = teiPerPsEventListMap[teiuid][psuid][y];
																}
																if (!evuid){
																	evuid =  "dummy";
																}
																var val = teiPsEventDeMap[teiuid + "-" + evuid + "-" + deuid];
																if (deuid == "orgUnit") {
																	val = eventToMiscMap[evuid].ou;//debugger
																} else if (deuid == "eventDate") {
																	val = eventToMiscMap[evuid].evDate;//debugger
																}
																if(psDes[x].dataElement.optionSet != undefined){

																	if(psDes[x].dataElement.optionSet.options != undefined){

																		val = storeeee[val+'_index'];
																		if (!val)
																			val="";
																		//  dataValues.push(value);

																	}
																}
																TheRows.push(val?val:"");
																console.log("control recieved");
															}
														  eventList[teiuid].push(TheRows);
										 self.postMessage(eventList);                                    
														

														}
													}

												var ttteiPerPsEventListMap = teiPerPsEventListMap;
												
												var ttteiList = Object.keys(teiList);
												
										
										
                                                       
												 console.log("reached at end");
												
											}
                                         //    self.postMessage([ttteiPerPsEventListMap,ttteiList]);    
								 
                                      									
								};
								
								var blob = new Blob(["onmessage ="+worker_fn.toString()], { type: "text/javascript" });

								var worker = new Worker(window.URL.createObjectURL(blob));
								worker.postMessage({ "args": [stageData,attrData,allenrollments,store,psdes] }); 
								worker.onmessage = function(e) 
								{
									
									
									
								
									 $scope.result = e.data;
									
								  
								};
						
                            
								
						
								
								
                           // arrangeDataX($scope.stageData, $scope.attrData, $scope.allenrollments);
                        })
                    })
       })


       }

        function showLoad()
        {// alert( "inside showload method 1" );
            setTimeout(function(){


              //  document.getElementById('load').style.visibility="visible";
             //   document.getElementById('tableid').style.visibility="hidden";

            },1000);

            //     alert( "inside showload method 2" );
        }
        function hideLoad() {

          //  document.getElementById('load').style.visibility="hidden";
          //  document.getElementById('tableid').style.visibility="visible";


        }
      /* function arrangeDataX(stageData,attrData,allenrollments){

            var report = [{
                teiuid : ""
            }]

            var teiWiseAttrMap = [];
            $scope.attrMap = [];
            $scope.teiList = [];
            $scope.eventList = [];
            $scope.maxEventPerTei = [];

            $scope.teiEnrollOrgMap = [];
            $scope.teiEnrollMap =[];

            var teiPsMap = [];
            var teiPsEventMap = [];
            var teiPsEventDeMap = [];
            var teiEventMap = [];


            // For attribute
            const index_tei = 0;
            const index_attruid = 2;
            const index_attrvalue = 3;
            // const index_attrname = 4;
            const index_ouname = 4;
            const index_enrollmentDate = 6;

            // For Data values
            const index_deuid = 5;
            const index_devalue = 7;
            const index_ps = 1;
            const index_ev = 3;
            const index_evDate = 4;
            const index_ou = 8;

            for (var i=0;i<attrData.height;i++){
                var teiuid = attrData.rows[i][index_tei];
                var attruid = attrData.rows[i][index_attruid];
                var attrvalue = attrData.rows[i][index_attrvalue];
                var ouname = attrData.rows[0][index_ouname];
                var enrollDate = attrData.rows[i][index_enrollmentDate]; // enrollment date
                enrollDate = enrollDate.substring(0, 10);
                if (teiWiseAttrMap[teiuid] == undefined){
                    teiWiseAttrMap[teiuid] = [];
                }
                teiWiseAttrMap[teiuid].push(attrData.rows[i]);
                // $scope.attrMap[teiuid+"-"+attruid] = ouname;
                $scope.attrMap[teiuid+"-"+attruid] = attrvalue;

                $scope.teiEnrollMap[teiuid+"-enrollDate"] = enrollDate;

                for (var k=0; k< allenrollments.enrollments.length;k++) {
                    if (allenrollments.enrollments[k].trackedEntityInstance == attrData.rows[i][0]) {
                        $scope.teiEnrollOrgMap[teiuid + "-ouname"] = allenrollments.enrollments[k].orgUnitName;
                    }
                }
            //    $scope.teiEnrollOrgMap[teiuid + "-ouname"] = ouname;
                for(m in $scope.Options){

                    if(attrvalue+'_index' == m){

                        $scope.attrMap[teiuid+"-"+attruid] = $scope.Options[m];
                    }

                }

            }

            for (key in teiWiseAttrMap){
                $scope.teiList.push({teiuid : key});
            //    $scope.attrMap =$scope.attrMap;
            }

            $timeout(function(){
                $scope.teiList = $scope.teiList;
            })
            $scope.teis = prepareListFromMap(teiWiseAttrMap);

            var teiPerPsEventListMap = [];
            var teiToEventListMap = [];
            var eventToMiscMap = [];
                eventToMiscMap["dummy"] = {ou : "" , evDate : ""};
            var teiList = [];
            for (var i=0;i<stageData.height;i++) {
                var teiuid = stageData.rows[i][index_tei];
                var psuid = stageData.rows[i][index_ps];
                var evuid = stageData.rows[i][index_ev];
                var evDate = stageData.rows[i][index_evDate];
                evDate = evDate.substring(0, 10);
                var deuid = stageData.rows[i][index_deuid];
                var devalue = stageData.rows[i][index_devalue];
                var ou = stageData.rows[i][index_ou];

                if (!teiList[teiuid]){
                    teiList[teiuid] = true;
                }
                if (!teiPerPsEventListMap[teiuid]) {
                    teiPerPsEventListMap[teiuid] = [];
                    teiPerPsEventListMap[teiuid].max = 0;
                }

                if (!teiPerPsEventListMap[teiuid][psuid]) {
                    teiPerPsEventListMap[teiuid][psuid] = [];

                }

                if (!teiToEventListMap[evuid]) {
                    teiToEventListMap[evuid] = true;
                    teiPerPsEventListMap[teiuid][psuid].push(evuid);
                    if (teiPerPsEventListMap[teiuid][psuid].length > teiPerPsEventListMap[teiuid].max) {
                        teiPerPsEventListMap[teiuid].max = teiPerPsEventListMap[teiuid][psuid].length;
                    }
                }

                if (!teiPsEventMap[teiuid + "-" + psuid + "-" + evuid]){
                    teiPsEventMap[teiuid + "-" + psuid + "-" + evuid] = [];
                }

                eventToMiscMap[evuid] = {ou : ou , evDate : evDate};
                teiPsEventDeMap[teiuid + "-" + evuid + "-" + deuid] = devalue;
            }
                var TheRows = [];
                var psDes = $scope.psDEs;

                for (key in teiList){
                    var teiuid = key;
                    $scope.eventList[teiuid] = [];

                    var maxEventCount = teiPerPsEventListMap[teiuid].max;

                    if (maxEventCount == 0){debugger}
                    for (var y=0;y<maxEventCount;y++){

                        TheRows = [];
                        for (var x=0;x<psDes.length;x++){
                        var psuid = psDes[x].dataElement.ps;
                        var deuid = psDes[x].dataElement.id;
                            var evuid = undefined;
                            if (teiPerPsEventListMap[teiuid][psuid]){
                                 evuid = teiPerPsEventListMap[teiuid][psuid][y];
                            }
                            if (!evuid){
                                evuid =  "dummy";
                            }
                            var val = teiPsEventDeMap[teiuid + "-" + evuid + "-" + deuid];
                            if (deuid == "orgUnit") {
                                val = eventToMiscMap[evuid].ou;//debugger
                            } else if (deuid == "eventDate") {
                                val = eventToMiscMap[evuid].evDate;//debugger
                            }
                            if($scope.psDEs[x].dataElement.optionSet != undefined){

                                if($scope.psDEs[x].dataElement.optionSet.options != undefined){

                                    val = $scope.Options[val+'_index'];
                                    if (!val)
                                        val="";
                                    //  dataValues.push(value);

                                }
                            }
                            TheRows.push(val?val:"");
                        }
                        $scope.eventList[teiuid].push(TheRows);
                    }
                }

            $scope.teiPerPsEventListMap = teiPerPsEventListMap;
            $scope.teiList = Object.keys(teiList);
            hideLoad();
        }

*/


    });
