import Map "mo:core/Map";
import Int "mo:core/Int";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Time "mo:core/Time";

module {
  public type RewardType = {
    #plastic_pirate;
    #runner;
    #hydrator;
    #sleepyhead;
  };

  public type RunningLog = {
    distance : Float;
    time : Int;
    pace : Float;
    timestamp : Int;
    completed : Bool;
  };

  public type DailyIntake = {
    date : Int;
    amount : Float;
  };

  public type UserData = {
    dailyGoal : Float;
    cupSize : Float;
  };

  public type HydrationLog = {
    date : Int;
    totalIntake : Float;
  };

  public type SleepLog = {
    date : Int;
    hours : Float;
  };

  public type CustomReminderDefinition = {
    name : Text;
    description : Text;
    intervalInNanos : Int;
    lastSent : Int;
    enabled : Bool;
  };

  public type ReminderType = {
    #water;
    #running;
    #sleep;
    #custom;
  };

  public type UserRewards = {
    streak : Nat;
    badges : [RewardType];
    completedGoals : Nat;
    lastUpdated : Int;
    lastGoalCompleteDay : Int;
  };

  public type UserAnalytics = {
    totalHydrationLogs : Nat;
    totalRunningLogs : Nat;
    totalSleepLogs : Nat;
    lastActiveDay : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  public type HydrationAndSleepSummary = {
    today : {
      intake : Float;
      sleep : Float;
      hasMetGoal : Bool;
      hasMetSleepGoal : Bool;
    };
    week : [WeeklySummaryDay];
    month : [MonthlySummaryDay];
    historical : {
      total : Float;
      averagePerDay : Float;
    };
    reminders : {
      water : Bool;
      running : Bool;
      custom : [CustomReminderDefinition];
    };
    streaks : {
      hydrationStreak : Nat;
      sleepStreak : Nat;
      combinedStreak : Nat;
      longestStreak : Nat;
    };
    badges : [RewardType];
  };

  public type WeeklySummaryDay = {
    date : Int;
    intake : Float;
    sleep : Float;
    metIntakeGoal : Bool;
    metSleepGoal : Bool;
    bothGoalsMet : Bool;
  };

  public type MonthlySummaryDay = {
    date : Int;
    intake : Float;
    sleep : Float;
    metIntakeGoal : Bool;
    metSleepGoal : Bool;
    bothGoalsMet : Bool;
  };

  public type OldActor = {
    userRewards : Map.Map<Principal, UserRewards>;
    userProfiles : Map.Map<Principal, UserProfile>;
    userData : Map.Map<Principal, UserData>;
    runningLogs : Map.Map<Principal, List.List<RunningLog>>;
    userIntakeHistory : Map.Map<Principal, List.List<HydrationLog>>;
    customReminders : Map.Map<Principal, Map.Map<Text, CustomReminderDefinition>>;
    sleepLogs : Map.Map<Principal, List.List<SleepLog>>;
    userAnalytics : Map.Map<Principal, UserAnalytics>;
  };

  public type NewActor = {
    userRewards : Map.Map<Principal, UserRewards>;
    userProfiles : Map.Map<Principal, UserProfile>;
    userData : Map.Map<Principal, UserData>;
    runningLogs : Map.Map<Principal, List.List<RunningLog>>;
    userIntakeHistory : Map.Map<Principal, List.List<HydrationLog>>;
    customReminders : Map.Map<Principal, Map.Map<Text, CustomReminderDefinition>>;
    sleepLogs : Map.Map<Principal, List.List<SleepLog>>;
    userAnalytics : Map.Map<Principal, UserAnalytics>;
  };

  public func run(old : OldActor) : NewActor {
    let newRewards = old.userRewards.map<Principal, UserRewards, UserRewards>(
      func(_p, rewards) { migrateRewards(rewards) }
    );
    { old with userRewards = newRewards };
  };

  func migrateRewards(rewards : UserRewards) : UserRewards {
    let streak = rewards.streak : Nat;
    {
      rewards with
      streak = adjustStreakForUpgrade(streak);
      badges = rewards.badges;
      completedGoals = rewards.completedGoals;
      lastUpdated = rewards.lastUpdated;
      lastGoalCompleteDay = rewards.lastGoalCompleteDay;
    };
  };

  func adjustStreakForUpgrade(streak : Nat) : Nat {
    if (streak + 1 > 0) { streak + 1 } else { 0 };
  };

  public func currentDay() : Int {
    Time.now() / 86400000000000;
  };
};
