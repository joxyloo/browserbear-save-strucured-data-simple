const fs = require('fs');
const API_KEY = 'your_api_key';
const TASK_UID = 'your_task_id';
const SAVE_STRUCTURED_DATA_STEP_ID = 'save_structured_data_step_id';

(async () => {
  const data = {
    // webhook_url: 'https://webhook.site/521cf880-fe8f-4285-889c-907a049a472e', // Option 1: Use a webhook to receive the result. Uncomment to use this option.
  };

  // Trigger the Browserbear task
  const run = await runTask(JSON.stringify(data));

  //   pollResult(run); // Option 2: Query the result using API Polling. Uncomment to use this option.
})();

function pollResult(run) {
  if (run.status === 'running' && run.uid) {
    const polling = setInterval(async () => {
      const runResult = await getRun(run.uid);

      if (runResult.status === 'running') {
        console.log('Still running.....');
      } else if (runResult.status === 'finished') {
        const structuredData = runResult.outputs[`${SAVE_STRUCTURED_DATA_STEP_ID}_save_structured_data`];
        clearInterval(polling);

        fs.writeFile('result.json', JSON.stringify(structuredData), (err) => {
          if (err) {
            console.log(err);
          }
        });
      }
    }, 1000);
  }
}

async function runTask(body) {
  const res = await fetch(`https://api.browserbear.com/v1/tasks/${TASK_UID}/runs`, {
    method: 'POST',
    body: body,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
  });

  return await res.json();
}

async function getRun(runId) {
  const res = await fetch(`https://api.browserbear.com/v1/tasks/${TASK_UID}/runs/${runId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  });

  return await res.json();
}
