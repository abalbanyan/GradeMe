env: clean-env
	tar -czvf env.tar.gz -C env .

sample sample-bad: clean-submission
	tar -czvf submission.tar.gz -C $@ .

clean-docker-containers:
	docker stop $(shell docker ps -aq) 2> /dev/null || \
	docker rm $(shell docker ps -aq) 2> /dev/null || \
	true

clean-docker-images: clean-docker-containers
	docker rmi $(shell docker images | grep -v "gcc" | awk '{print $3}')

clean-%:
	rm $*.tar.gz 2> /dev/null || true

clean: clean-env clean-submission clean-docker-containers
	
.PHONY: env sample sample-bad clean-% clean clean-docker-containers clean-docker-images
