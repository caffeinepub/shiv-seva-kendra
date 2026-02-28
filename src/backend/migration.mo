import Text "mo:core/Text";

module {
  type OldActor = {
    shivSevaKendraInfo : {
      name : Text;
      address : Text;
      phone : Text;
      email : Text;
    };
  };

  type NewActor = {};

  public func run(_ : OldActor) : NewActor {
    {};
  };
};
