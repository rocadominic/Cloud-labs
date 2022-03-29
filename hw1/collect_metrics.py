import requests
import time
import concurrent.futures

MAX_THREADS = 10
BATCH_SIZE = 10
BATCH_COUNT = 10
SERVICE_URL = "http://localhost:5000"

def call_service():
    return requests.get(SERVICE_URL)

def collect_batch():
    lat = []
    ok = []
    with concurrent.futures.ThreadPoolExecutor(MAX_THREADS) as tp_executor:
        threads = []
        for _ in range(BATCH_SIZE):
            threads.append(tp_executor.submit(call_service))
        for t in threads:
            res = t.result()
            lat.append(res.elapsed.total_seconds())
            ok.append(res.status_code == 200)
    return (lat, ok)

if __name__ == '__main__':
    lats = []
    oks = []
    for b in range(BATCH_COUNT):
        print("Batch {}".format(b+1))
        begin = time.perf_counter()
        lat, ok = collect_batch()
        lats += lat
        oks += ok
        print('Batch time: {}'.format('{:.4f}s'.format((time.perf_counter() - begin))))
    print('Summary')
    print('200 OK: {}/{}'.format(sum(oks), len(oks)))
    print('AVG latency: {:.4f}s'.format(sum(lats)/len(lats)))
    print('MAX latency: {:.4f}s'.format(max(lats)))
    print('MIN latency: {:.4f}s'.format(min(lats)))
