
// Configure Credentials to use Cognito
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:d123acd6-c3b4-44fe-9e93-d764e79a2566'
});

AWS.config.region = 'us-east-1';
            
// We're going to partition Amazon Kinesis records based on an identity.
// We need to get credentials first, then attach our event listeners.
AWS.config.credentials.get(function(err) {
    // attach event listener
    if (err) {
        alert('Error retrieving credentials.');
        console.error(err);
        return;
    }

    var firehose = new AWS.Firehose({apiVersion: '2015-08-04'});

    var recordData = [];
    var TID = null;

    var viewWidth = window.innerWidth;
    window.addEventListener('resize', function(event) {
        viewWidth = window.innerWidth;
    });

    document.addEventListener('mousemove', function(event) {
         clearTimeout(TID);
         // Prevent creating a record while a user is actively scrolling
         TID = setTimeout(function() {

            // normalizedX 0 is the center of the viewport
            var normalizedX = event.offsetX - Math.round(viewWidth / 2);
            
            console.log(normalizedX, event.offsetY);
 
             // Create the Amazon Kinesis record
             var record = {
                 Data: JSON.stringify({
                     page: window.location.href,
                     x: normalizedX,
                     y: event.offsetY
                 }) + "\n"};
             recordData.push(record);
         }, 100);
     });

    // upload data to Amazon Kinesis every second if data exists
    setInterval(function() {
        if (!recordData.length) {
            return;
        }
        // upload data to Amazon Kinesis
        firehose.putRecordBatch({
            Records: recordData,
            DeliveryStreamName: 'test-stream-1'
        }, function(err, data) {
            if (err) {
                console.error(err);
            }
        });
        // clear record data
        recordData = [];
    }, 1000);
});
