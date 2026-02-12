PROMPT 001.
Follow instructions in speckit.specify.prompt.md.
Build Comprehensive Specification for the First Feature of Our App which is a very simple. But keep in mind Make sure it is with 100% compliance and follows the Constitution.
The First Feature We need is related to the Setup of the Application. The feature Enables The User to Create, and Update ACTIONS of the System. So The Landing Page will Show a Table of ACTIONS in the System Which The User can Either Create or Update.
This Feature Comes in the Security Domain/Module so the Table That Stores Actions must be Sec_Actions Table With Columns
ActionID, ActionCode, ActionTitle, CreatedBy (INT for UserID), CreatedDate (DateTime2), ModifiedBy, ModifiedDate.
The table on the Landing Page will have all the Columns Including Audit and a column in the end of "Actions" and Update Button/Icon must be shown.
A View needs to be prepared for Creation and Editing of The Actions.
The User Can Update/Create Action Code, Action Title in the UI.
Main View "/Sec/Actions"
Create View "/Sec/Actions/New"
Update View "/Sec/Actions/<ActionID>"

PROMPT 02.
Follow instructions in speckit.plan.prompt.md.
Plan for the Practical Implementation of the Fully Functional Feature. Go through each Specifcation thoroughly.