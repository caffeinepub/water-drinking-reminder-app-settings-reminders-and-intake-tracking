import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type OldRewardType = {
    #plastic_pirate;
    #runner;
    #hydrator;
    #sleepyhead;
  };

  type OldUserRewards = {
    streak : Nat;
    badges : [OldRewardType];
    completedGoals : Nat;
  };

  type OldActor = {
    userRewards : Map.Map<Principal, OldUserRewards>;
  };

  type NewRewardType = OldRewardType;

  type NewUserRewards = {
    streak : Nat;
    badges : [NewRewardType];
    completedGoals : Nat;
    lastUpdated : Int;
  };

  type NewActor = {
    userRewards : Map.Map<Principal, NewUserRewards>;
  };

  public func run(old : OldActor) : NewActor {
    let newUserRewards = old.userRewards.map<Principal, OldUserRewards, NewUserRewards>(
      func(_principal, oldRewards) {
        {
          oldRewards with
          lastUpdated = 0;
        };
      }
    );
    { userRewards = newUserRewards };
  };
};
