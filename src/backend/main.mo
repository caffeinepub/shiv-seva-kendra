import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Migration "migration";

(with migration = Migration.run)
actor {
  type ShivSevaKendra = {
    name : Text;
    address : Text;
    phone : Text;
    email : Text;
  };

  type Appointment = {
    id : Nat;
    customerName : Text;
    mobileNumber : Text;
    preferredTime : ?Text;
    createdAt : Int;
  };

  type SubServiceItem = {
    nameEn : Text;
    nameMr : Text;
  };

  type AdminJob = {
    id : Nat;
    title : Text;
    notifDate : Text;
    vacancy : Text;
    salary : Text;
    lastDate : Text;
    fees : Text;
    createdAt : Int;
  };

  type AdminService = {
    id : Nat;
    mainNameEn : Text;
    mainNameMr : Text;
    subServices : [SubServiceItem];
  };

  public type AddJobResult = {
    #ok : Nat;
    #err : Text;
  };

  public type AddServiceResult = {
    #ok : Nat;
    #err : Text;
  };

  var adminPrincipal : ?Principal = null;
  var appointments : [Appointment] = [];
  var adminJobs : [AdminJob] = [];
  var adminServices : [AdminService] = [];
  var nextAppointmentId = 1;
  var nextJobId = 1;
  var nextServiceId = 1;

  public shared ({ caller }) func setAdmin() : async Bool {
    switch (adminPrincipal) {
      case (null) {
        adminPrincipal := ?caller;
        true;
      };
      case (?admin) {
        if (caller == admin) {
          adminPrincipal := ?admin;
          true;
        } else {
          Runtime.trap("Only the current admin can change the admin principal.");
        };
      };
    };
  };

  public query ({ caller }) func getShivSevaKendraInfo() : async ShivSevaKendra {
    {
      name = "Shiv Seva Kendra";
      address = "उत्रण ता. एरंडोल जि. जळगाव";
      phone = "7720814323";
      email = "shubhamkoli918@gmail.com";
    };
  };

  func isAdmin(caller : Principal) : Bool {
    switch (adminPrincipal) {
      case (?admin) { caller == admin };
      case (null) { false };
    };
  };

  public query ({ caller }) func getAdminPrincipal() : async ?Principal {
    adminPrincipal;
  };

  public shared ({ caller }) func bookAppointment(customerName : Text, mobileNumber : Text, preferredTime : ?Text) : async Nat {
    let newAppointment : Appointment = {
      id = nextAppointmentId;
      customerName;
      mobileNumber;
      preferredTime;
      createdAt = Time.now();
    };
    appointments := appointments.concat([newAppointment]);
    nextAppointmentId += 1;
    newAppointment.id;
  };

  public query ({ caller }) func getAppointments() : async [Appointment] {
    if (isAdmin(caller)) {
      appointments;
    } else {
      [];
    };
  };

  public shared ({ caller }) func addJob(title : Text, notifDate : Text, vacancy : Text, salary : Text, lastDate : Text, fees : Text) : async AddJobResult {
    if (not isAdmin(caller)) {
      return #err("Only admin can add job notifications.");
    };

    let newJob : AdminJob = {
      id = nextJobId;
      title;
      notifDate;
      vacancy;
      salary;
      lastDate;
      fees;
      createdAt = Time.now();
    };
    adminJobs := adminJobs.concat([newJob]);
    nextJobId += 1;
    #ok(newJob.id);
  };

  public query ({ caller }) func getAdminJobs() : async [AdminJob] {
    adminJobs;
  };

  public shared ({ caller }) func deleteJob(id : Nat) : async Bool {
    if (not isAdmin(caller)) {
      Runtime.trap("Only admin can delete jobs.");
    };
    let filteredJobs = adminJobs.filter(func(job) { job.id != id });
    let jobExisted = filteredJobs.size() < adminJobs.size();
    adminJobs := filteredJobs;
    jobExisted;
  };

  public shared ({ caller }) func addService(
    mainNameEn : Text,
    mainNameMr : Text,
    subServices : [SubServiceItem],
  ) : async AddServiceResult {
    if (not isAdmin(caller)) {
      return #err("Only admin can add services.");
    };

    let newService : AdminService = {
      id = nextServiceId;
      mainNameEn;
      mainNameMr;
      subServices;
    };
    adminServices := adminServices.concat([newService]);
    nextServiceId += 1;
    #ok(newService.id);
  };

  public query ({ caller }) func getAdminServices() : async [AdminService] {
    adminServices;
  };

  public shared ({ caller }) func deleteService(id : Nat) : async Bool {
    let filteredServices = adminServices.filter(func(service) { service.id != id });
    let serviceExisted = filteredServices.size() < adminServices.size();
    adminServices := filteredServices;
    serviceExisted;
  };
};

