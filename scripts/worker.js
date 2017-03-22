
onmessage = function(e) {
  console.log('Message received from main script');
 // var workerResult = (parseInt(e.data)) ;

   // var aa=e.data;
    //console.log(aa);
 
    /* Reads number to print table */
     var args = e.data.args;
      var stageData = e.data.args[0];
       var attrData = e.data.args[1];
        var allenrollments = e.data.args[2];
      // console.log(argss +""+ argsss);
   /* for(var i=1; i<=1000; i++)
    {
       var workerResult = (parseInt(e.data)*i) ;
        postMessage(parseInt(e.data)+"*"+i+"="+workerResult); 
        overload();
               
    }*/
        arrangeDataX(stageData,attrData,allenrollments);
       function arrangeDataX(stageData,attrData,allenrollments){

            var report = [{
                teiuid : ""
            }]

            var teiWiseAttrMap = [];
            attrMap = [];
            teiList = [];
            eventList = [];
          maxEventPerTei = [];

            teiEnrollOrgMap = [];
            teiEnrollMap =[];

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
                attrMap[teiuid+"-"+attruid] = attrvalue;

                teiEnrollMap[teiuid+"-enrollDate"] = enrollDate;

                for (var k=0; k< allenrollments.enrollments.length;k++) {
                    if (allenrollments.enrollments[k].trackedEntityInstance == attrData.rows[i][0]) {
                        teiEnrollOrgMap[teiuid + "-ouname"] = allenrollments.enrollments[k].orgUnitName;
                    }
                }
            //    $scope.teiEnrollOrgMap[teiuid + "-ouname"] = ouname;
                for(m in Options){

                    if(attrvalue+'_index' == m){

                        attrMap[teiuid+"-"+attruid] = Options[m];
                    }

                }

            }

            for (key in teiWiseAttrMap){
                teiList.push({teiuid : key});
            //    $scope.attrMap =$scope.attrMap;
            }

            $timeout(function(){
                teiList = $scope.teiList;
            })
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
                var psDes = psDEs;

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
                            if(psDEs[x].dataElement.optionSet != undefined){

                                if(psDEs[x].dataElement.optionSet.options != undefined){

                                    val = Options[val+'_index'];
                                    if (!val)
                                        val="";
                                    //  dataValues.push(value);

                                }
                            }
                            TheRows.push(val?val:"");
                        }
                      eventList[teiuid].push(TheRows);
                    }
                }

            teiPerPsEventListMap = teiPerPsEventListMap;
            teiList = Object.keys(teiList);
            hideLoad();
        }




    
 
   

 
 
  console.log('Posting message back to main script');
  
 
}



