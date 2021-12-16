
var numOfUser=0;
var url="";
var gender="";

//if user select a gender populate the gender var with the selected gender
$("#genderSelect").change(()=>{
    gender=$("#genderSelect option:selected").text().toLowerCase();
})

//att button click check if the user entered a number of people he wanna see and generate the url, then fetch
$("#btn").click( (e)=>{
    e.preventDefault();

    if($("#textfield").val() > 0){
        numOfUser = $("#textfield").val();
        $("body").addClass("loading");
        url= `https://randomuser.me/api/?gender=${gender}&results=${numOfUser}`;
 
        fetch(url)
            .then(fetchErrorCheckAndGenerateJson)
            .then(printUserHTMl)
            .catch(function(error){
                alert(error);
                location.reload();
            })
            .finally(removeLoading);  
    } else {
        alert("you need to put the number of users you wanna see");
    }

});


// remove and show some element in the page
function removeLoading(){
    $(".inputForm").hide();
    $("body").removeClass("loading");
    $("#country").show();
    $("#sort").show();
    $(".searchbar").show();
}
    
//check if fetch went ok and create the json
function fetchErrorCheckAndGenerateJson(response){
    if (response.status == 200) {
        return response.json();
    } 
};

































//generate the grid html
function printUserHTMl(data){
    var country = [];
    var user = [];

    //generate the select with all the states removing the duplicated
    for(var i=0; i<numOfUser; i++){
        console.log($(`#country option[value='${data.results[i].location.country}']`).length);
        if(!$(`#country option[value='${data.results[i].location.country}']`).length > 0){
            country = (`<option value="${data.results[i].location.country}">${data.results[i].location.country}</option>`);
            $("#country").append(country);
        }
    
        //generate the user card
        user.push(`
        <div class="user-box">
            <img src='${data.results[i].picture.medium}' alt=''>
            <h2>${data.results[i].name.first} ${data.results[i].name.last}</h2>
            <a href= "mailto:${data.results[i].email}">${data.results[i].email}</a>
            <p class="countryP">${data.results[i].location.country}</p>
            <p class="age">Age: ${data.results[i].dob.age}</p>
        </div>
        `);
    }
    $(".grid-container").append(user);


    //call the function to add the details card, filter, sortby, searchbar
    box(data);
    filterChange(data);
    sortBy(data);
    search(data);
};





































//function to generate the details card for every user
function box(data, numOfUser){

    $(".user-box").click(function rei(){
        console.log(data.results);
        if($(event.target).hasClass("user-box")){
            var index = $(event.target).index();
        } else {
            var index = $(event.target).parent().index();
        }
   
        HTML(index, function(){});
        generateInternalHTML(index);
        return index;
    });


    //generate the card html widht close button and arrows
    function HTML(index){
        var userSelected= `
        <div class="overlay">
                <div class="user-box-selected">
                    <img src="img/close.png" alt="" class="close">
                    <h1 class="left"><</h1>
                    <h1 class="right">></h1>
                    <div class="card"></div>
                </div>
            </div>
        `;
        $("body").append(userSelected);

        
        $(".close").on("click", ()=>{
            $(".overlay").remove();
            console.log("close");
        });
    
    
        $(".left").on("click",() => {
            if(index > 0 && index <= numOfUser){
                index--;
                console.log(index);
                generateInternalHTML(index);
            }
        });
    
    
        $(".right").on("click",() => {
            if(index >= 0 && index < numOfUser - 1){
                index++;
                console.log(index);
                generateInternalHTML(index);
            }
        });

    }

    //generate only the user's personal info, used when we scroll from card to card
    function generateInternalHTML(index){
        $(".card *").remove();
        
        var path= data.results[index];
        var intUserSelected = `
            <img src='${path.picture.large}' alt=''>
            <h2>${path.name.first} ${path.name.last}</h2>
            <a href= "mailto:${path.email}">${path.email}</a>
            <p>${path.location.city}</p>
            <div class="br"></div>
            <p>${path.cell}</p>
            <p>${path.location.street.name} 
                ${path.location.street.number}, 
                ${path.location.city} 
                ${path.location.state} 
                ${path.location.postcode}
            </p>
            <p>Birthday: ${(data.results[index].dob.date).substring(0,10)}</p>
        `;
        $(".card").append(intUserSelected);
        
    };


};

































//filter function for states, change the data object and call the function that generate the html
function filterChange(data){

    
    $("#country").on("change", ()=>{
        var newData = $.extend(true, {}, data);
        var country= $("#country option:selected").text();

        for(var a = data.results.length - 1; a>=0; a--){
            if(newData.results[a].location.country !== country && country !== "All"){
                newData.results.splice(a,1);
                numOfUser= newData.results.length;
            }
        }
        if(country === "All"){
            printUserHTMl;
            sortIF(newData);
            numOfUser=data.results.length;
        }
        if(country !== "All"){
            sortIF(newData);
        }

        printUserNewHTMl(newData);
        sortIF(newData);
        sortBy(newData);
        search(newData);
        
    });


}

//generate html grid when filtering 
function printUserNewHTMl(newData){
    var user = [];
    const newNumOfUser=newData.results.length;

    for(var i=0; i<newNumOfUser; i++){
        user.push(`
            <div class="user-box">
                <img src='${newData.results[i].picture.medium}' alt=''>
                <h2>${newData.results[i].name.first} ${newData.results[i].name.last}</h2>
                <a href= "mailto:${newData.results[i].email}">${newData.results[i].email}</a>
                <p class="countryP">${newData.results[i].location.country}</p>
                <p class="age">Age: ${newData.results[i].dob.age}</p>
            </div>
        `);
    }
    $(".grid-container").html(user);
    box(newData, numOfUser);
};





    






















//sort by function that on the sort select call the sort algoritm
function sortBy(newData){
 
    $("#sort").on("change", ()=>{

        sortIF(newData);
        printUserNewHTMl(newData);
        search(newData);

    });
}



//sort algoritm
function sortIF(newData){

    if($("#sort option:selected").text() === "Age ascending"){
        newData.results.sort(function(a,b){
            return a.dob.age - b.dob.age;
        });
    }
    if($("#sort option:selected").text() === "Age descending"){
        newData.results.sort(function(a,b){
            return b.dob.age - a.dob.age;
        });
    }
    if($("#sort option:selected").text() === "Alphabetic ascending"){
        newData.results.sort(function(a,b){
            return a.name.first.localeCompare(b.name.first);
        });
    }
    if($("#sort option:selected").text() === "Alphabetic descending"){
        newData.results.sort(function(a,b){
            return b.name.first.localeCompare(a.name.first);
        });
    }
};






















//function for the searchbar that display only matched first name or last name
function search(newData){
    var newDataSearch=$.extend(true, {}, newData);
    $(".searchbar").on("input", ()=> searchEngine());


    function searchEngine(){
        for(var a = newDataSearch.results.length - 1; a>=0; a--){
            if(!((newDataSearch.results[a].name.first)+(newDataSearch.results[a].name.last)).toLowerCase().includes(($(".searchbar").val()).toLowerCase().replace(/ /g,''))){
                newDataSearch.results.splice(a,1);
            };
        }
        numOfUser= newDataSearch.results.length;
        printUserNewHTMl(newDataSearch);
        newDataSearch=$.extend(true, {}, newData);
    }

    searchEngine();
}






