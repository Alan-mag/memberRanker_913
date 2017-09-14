// Goal:
//
// Participation Activity Rankings for U.S. Members of Congress
//
// Morgan Griffith [Rank: 1]
// Town Halls             : 0
// Ticketed Events        : 0
// Tele-Town Halls        : 0
// Office Hours           : 52
// Empty Chair Town Halls : 0
// Other                  : 0
// Total                  : 52
// ---------------------------
// Brad Schneider [Rank: 2]
// Town Halls             : 3
// Ticketed Events        : 0
// Tele-Town Halls        : 0
// Office Hours           : 18
// Empty Chair Town Halls : 0
// Other                  : 6
// Total                  : 27
// ---------------------------
// Ron Wyden [Rank: 3]
// Town Halls             : 25
// Ticketed Events        : 0
// Tele-Town Halls        : 0
// Office Hours           : 0
// Empty Chair Town Halls : 0
// Other                  : 0
// Total                  : 25
// ---------------------------

(function(module) {
    memberRanker = {};
  
    // let date_list = ['2017-0', '2017-1', '2017-2', '2017-3', '2017-4', '2017-5', '2017-6', '2017-7'];
    let date_list = ["2017-0", "2017-1", "2017-4", "2017-7"];
  
    // build state report object
    function MemberReport(
      name,
      rank,
      totalEvents,
      townHall,
      ticketedEvent,
      teleTownHall,
      officeHour,
      emptyChair,
      other
    ) {
      this.name = name;
      this.rank = rank;
      this.totalEvents = totalEvents;
      this.townHall = townHall;
      this.ticketedEvent = ticketedEvent;
      this.teleTownHall = teleTownHall;
      this.officeHour = officeHour;
      this.emptyChair = emptyChair;
      this.other = other;
    }
  
    function getMetaData(dateList, members_obj) {
      return new Promise(function(resolve, reject) {
        var mem_exists;
  
        for (var j = 0; j < dateList.length; j++) {
          let date_key = dateList[j];
          firebase
            .database()
            .ref("/townHallsOld/" + date_key)
            .once("value")
            .then(function(snapshot) {
              snapshot.forEach(function(oldTownHall) {
                town_hall = oldTownHall.val();
                mem_exists = false;
  
                for (var k = 0; k < members_obj.members_array.length; k++) {
                  if (members_obj.members_array[k].name === town_hall.Member) {
                    // once updated, this will be 'stateName'
                    mem_exists = true;
                    current_state_report = members_obj.members_array[k];
                  }
                }
  
                if (mem_exists === false) {
                  current_state_report = new MemberReport(
                    town_hall.Member,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                  );
                  members_obj.members_array.push(current_state_report);
                }
  
                if (town_hall.meetingType) {
                  current_state_report.totalEvents++;
                }
  
                switch (town_hall.meetingType) {
                  case "Town Hall":
                    current_state_report.townHall++;
                    break;
                  case "Ticketed Event":
                    current_state_report.ticketedEvent++;
                    break;
                  case "Tele-Town Hall":
                    current_state_report.teleTownHall++;
                    break;
                  case "Office Hours":
                    current_state_report.officeHour++;
                    break;
                  case "Empty Chair Town Hall":
                    current_state_report.emptyChair++;
                    break;
                  default:
                    // console.log(town_hall.meetingType);
                    current_state_report.other++;
                    break;
                }
              });
            });
        }
        resolve(members_obj);
      });
    }
  
    // function to calculate rank
    function rankStates(membersObj, eventType) {
      return new Promise(function(resolve, reject) {
        setTimeout(function() {
          membersObj.members_array.sort(function(a, b) {
            return b[eventType] - a[eventType];
          });
          var blah = membersObj;
          resolve(blah);
        }, 4000);
      });
    }
  
    // display output function
    function outputReport(orderedMembers, numberOfMembers) {
      var num;
      if (numberOfMembers) {
          num = numberOfMembers;
      } else {
        num = orderedMembers.members_array.length;
      }

      for (var i = 1; i <= num; i++) {
        var mem = orderedMembers.members_array[i - 1];
        mem.rank = i;
        console.log(mem.name + " [Rank: " + mem.rank + "]");
        console.log("Town Halls             : " + mem.townHall);
        console.log("Ticketed Events        : " + mem.ticketedEvent);
        console.log("Tele-Town Halls        : " + mem.teleTownHall);
        console.log("Office Hours           : " + mem.officeHour);
        console.log("Empty Chair Town Halls : " + mem.emptyChair);
        console.log("Other                  : " + mem.other);
        console.log("Total                  : " + mem.totalEvents);
        console.log("---------------------------");
      }
  
      // write to csv file
      var arr = orderedMembers.members_array.slice(0, num);
      csv(arr);
    }
  
    // write to csv format
    function csv(array) {
      var keys = Object.keys(array[0]);
  
      var result = keys.join(",") + "\n";
  
      array.forEach(function(obj) {
        keys.forEach(function(k, ix) {
          if (ix) result += ",";
          result += obj[k];
        });
        result += "\n";
      });
      console.log(result);
      // fs.writeFile('rankddata.csv', result, (err) => {
      //   if (err) throw err;
      //   console.log('the file has been saved!');
      // })
    }
  
    memberRanker.rankMembers = function(eventType, numberOfMembers) {
      var members_obj = {
        members_array: []
      };
      getMetaData(date_list, members_obj)
        .then(function(members) {
          rankStates(members, eventType)
            .then(function(rankedMembers) {
              outputReport(rankedMembers, numberOfMembers);
            })
            .catch(function(error) {
              console.log("oh, shit..", error);
            });
        })
        .catch(function(error) {
          console.log("something went wrong ", error);
        });
    };
  
    module.memberRanker = memberRanker;
  })(window);
  