angular.module('myApp',[ 'ui.bootstrap'])

.controller("mycontroller",function($scope, $http){
	$scope.choice="1";
	$scope.display=false;
	$scope.message="";
	$scope.suggestions =[];
	$scope.mistake=false;
	$scope.autocompleteDisplay=false;
	$scope.search=function(){
		$scope.autocompleteDisplay=false;
		$scope.mistake=false;
		$scope.display=false;
		$scope.suggestions="";
		$scope.message="";
		if($scope.inputData=="")
			return;

		var _url;
		// if($scope.choice=="1")
		// {
		// 	console.log("default");
		// 	_url='api/search';	
		// }
		
 	// 	if($scope.choice=="2")
 	// 	{
 	// 		console.log("pageRank");
 	// 		_url= 'api/search2';
 	// 	}
 		_url='api/search';
 		var req = {
				method: 'POST',
 				url: _url,
 				data: { q:$scope.inputData,
 				c:$scope.choice }
 		};
 		$http(req).then(
	 		function success(data){
	 			var temp= angular.fromJson(data.data);
	 			console.log(temp.response);
	 			if(temp.response.numFound==0){
					var req2 = {
						method: 'POST',
		 				url: 'api/correct',
 						data: { q:$scope.inputData
 						}
 					};
 					$http(req2).then(
	 					function success(data){
	 						$scope.mistake=true;
	 						$scope.correctWord=data.data[$scope.inputData];
	 					}, 
 						function error(data){
 							console.log("error");
	 					}
 					);
	 			}
	 			else{
	 				$scope.display=true;	
		 			$scope.result= temp.response.docs;	
		 			console.log(temp.response.docs);
		 			var list="";
		 			for(i=0;i<10;i++){
		 				list+= temp.response.docs[i].id;
		 				list+="\n";
		 			}
		 			
		 			$scope.Snippet(list);
	 			}
	 		}, 
 			function error(data){
 				console.log("error");
	 		}
 		);
 		
	};
	$scope.correctClick=function(){
		$scope.inputData = $scope.correctWord;
		$scope.mistake=false;
		$scope.autocompleteDisplay=false;
		$scope.search();
	};
	$scope.changeToSuggestion = function(item){
		$scope.inputData =item;
		$scope.autocompleteDisplay=false;
	}

	$scope.autocomplete = function(){
		$scope.autocompleteDisplay=true;
		if($scope.inputData.length<=1){
			$scope.autocompleteDisplay=false;
 			return;
		}
		var req = {
			method: 'POST',
		 	url: 'api/complete',
 			data: { q:$scope.inputData }
 		};

 		$http(req).then(
	 		function success(response){
	 			temp = angular.fromJson(response.data);
	 		
	 			if(typeof(temp.spellcheck.suggestions) == "undefined"){
	 				console.log("here");
	 			}
	 			else{
	 				temp= angular.fromJson(temp.spellcheck);
	 				temp= angular.fromJson(temp.suggestions);
	 				temp= angular.fromJson(temp[$scope.inputData]);
	 				temp=temp.suggestion;
	 				$scope.suggestions =temp;
	 			}
	 		}, 
 			function error(data){
 				console.log("error");
	 		}
 		);
	};

	$scope.Snippet=function(arr)
	{
		var req = {
			method: 'POST',
		 	url: 'api/snippet',
 			data: { l:arr,
 				q:$scope.inputData
 			}
 		};
 		$http(req).then(
	 		function success(data){	 	
	 			$scope.snippets=data.data.t
	 			console.log($scope.snippets);
	 			
	 			// $scope.correctWord=data.data[$scope.inputData];
	 		}, 
 			function error(data){
 				console.log("error");
	 		}
 		);
	}
});


